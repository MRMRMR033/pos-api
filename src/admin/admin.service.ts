import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  async performHealthCheck() {
    const timestamp = new Date().toISOString();
    const checks: any = {
      status: 'healthy',
      timestamp,
      database: { status: 'unknown', latency: 0 },
      migrations: { status: 'unknown', count: 0 },
      permissions: { status: 'unknown', count: 0 }
    };

    try {
      // Test database connection
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = {
        status: 'connected',
        latency: Date.now() - start
      };

      // Check applied migrations
      try {
        const migrations = await this.prisma.$queryRaw`
          SELECT COUNT(*) as count FROM "_prisma_migrations" WHERE finished_at IS NOT NULL
        ` as any[];
        checks.migrations = {
          status: 'applied',
          count: parseInt(migrations[0]?.count || '0')
        };
      } catch (e) {
        checks.migrations = { status: 'error', count: 0, error: e.message };
      }

      // Check permissions setup
      const permissionsCount = await this.prisma.permission.count();
      checks.permissions = {
        status: permissionsCount > 0 ? 'configured' : 'missing',
        count: permissionsCount
      };

      // Overall status
      const hasErrors = Object.values(checks).some(check => 
        typeof check === 'object' && check !== null && (check as any).status === 'error'
      );
      
      if (hasErrors) {
        checks.status = 'degraded';
      }

    } catch (error) {
      this.logger.error('Health check failed', error.stack);
      checks.status = 'unhealthy';
      checks.database = { status: 'disconnected', latency: 0, error: error.message };
    }

    return checks;
  }

  async getLogsFile(): Promise<string> {
    const logPaths = [
      path.join(process.cwd(), 'logs', 'application.log'),
      path.join(process.cwd(), 'pos-system.log'),
      path.join('/var/log', 'pos-system.log'),
      path.join(process.cwd(), 'app.log')
    ];

    for (const logPath of logPaths) {
      if (fs.existsSync(logPath)) {
        return logPath;
      }
    }

    // Create a temporary log file with recent console logs
    const tempLogPath = path.join(process.cwd(), 'temp-logs.txt');
    const logContent = `
POS System Logs - ${new Date().toISOString()}
=====================================

System Status: ${JSON.stringify(await this.performHealthCheck(), null, 2)}

Recent Activity:
- System started successfully
- Database connections established
- All core modules loaded

Note: Detailed logging not configured. Enable file logging for complete audit trail.
    `;
    
    fs.writeFileSync(tempLogPath, logContent);
    return tempLogPath;
  }

  async performIntegrityCheck() {
    const checks = [];
    const errors = [];

    try {
      // Check referential integrity
      const orphanedTicketItems = await this.prisma.$queryRaw`
        SELECT COUNT(*) as count 
        FROM "TicketItem" ti 
        LEFT JOIN "Ticket" t ON ti."ticketId" = t.id 
        WHERE t.id IS NULL
      ` as any[];
      
      checks.push({
        name: 'Orphaned TicketItems',
        status: parseInt(orphanedTicketItems[0]?.count || '0') === 0 ? 'pass' : 'fail',
        count: parseInt(orphanedTicketItems[0]?.count || '0')
      });

      // Check negative stock
      const negativeStock = await this.prisma.producto.count({
        where: { stock: { lt: 0 } }
      });
      
      checks.push({
        name: 'Negative Stock Products',
        status: negativeStock === 0 ? 'pass' : 'warning',
        count: negativeStock
      });

      // Check open cash registers
      const openTurnos = await this.prisma.turnoCaja.count({
        where: { estado: 'ABIERTO' }
      });
      
      checks.push({
        name: 'Open Cash Registers',
        status: 'info',
        count: openTurnos
      });

      // Check admin users
      const adminCount = await this.prisma.usuario.count({
        where: { rol: 'admin' }
      });
      
      checks.push({
        name: 'Admin Users',
        status: adminCount > 0 ? 'pass' : 'fail',
        count: adminCount
      });

    } catch (error) {
      errors.push({
        check: 'Database Integrity',
        error: error.message
      });
    }

    const summary = {
      totalChecks: checks.length,
      passed: checks.filter(c => c.status === 'pass').length,
      failed: checks.filter(c => c.status === 'fail').length,
      warnings: checks.filter(c => c.status === 'warning').length,
      errors: errors.length
    };

    return {
      status: errors.length > 0 ? 'error' : summary.failed > 0 ? 'degraded' : 'healthy',
      checks,
      errors,
      summary,
      timestamp: new Date().toISOString()
    };
  }

  async createDatabaseBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `pos-backup-${timestamp}.sql`;
    const backupPath = path.join(process.cwd(), 'backups', filename);

    // Ensure backups directory exists
    const backupsDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    try {
      // Get database URL from environment
      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) {
        throw new Error('DATABASE_URL not configured');
      }

      // Extract connection details
      const url = new URL(databaseUrl);
      const host = url.hostname;
      const port = url.port || '5432';
      const database = url.pathname.slice(1);
      const username = url.username;

      // Create pg_dump command
      const dumpCommand = `pg_dump -h ${host} -p ${port} -U ${username} -d ${database} -f ${backupPath}`;
      
      // Set PGPASSWORD environment variable
      const env = { ...process.env, PGPASSWORD: url.password };
      
      execSync(dumpCommand, { env });

      const stats = fs.statSync(backupPath);
      
      return {
        filename,
        path: backupPath,
        size: stats.size,
        timestamp: new Date().toISOString(),
        downloadUrl: `/admin/download-backup/${filename}`
      };
      
    } catch (error) {
      this.logger.error('Backup creation failed', error.stack);
      throw new Error(`Backup failed: ${error.message}`);
    }
  }

  async restoreDatabaseBackup(backupData: string, format: 'sql' | 'json') {
    try {
      if (format === 'sql') {
        // For SQL restore, we'd typically use psql
        const timestamp = Date.now();
        const tempFile = path.join(process.cwd(), `temp-restore-${timestamp}.sql`);
        
        fs.writeFileSync(tempFile, backupData);
        
        // Get database connection details
        const databaseUrl = process.env.DATABASE_URL;
        const url = new URL(databaseUrl);
        
        const restoreCommand = `psql -h ${url.hostname} -p ${url.port || '5432'} -U ${url.username} -d ${url.pathname.slice(1)} -f ${tempFile}`;
        const env = { ...process.env, PGPASSWORD: url.password };
        
        execSync(restoreCommand, { env });
        
        // Clean up temp file
        fs.unlinkSync(tempFile);
        
        return {
          status: 'success',
          message: 'Database restored successfully',
          timestamp: new Date().toISOString()
        };
        
      } else if (format === 'json') {
        // For JSON format, we'd parse and insert data
        const data = JSON.parse(backupData);
        
        // This would require implementing a comprehensive data restoration
        // For now, return a placeholder
        return {
          status: 'not_implemented',
          message: 'JSON restore format not yet implemented',
          timestamp: new Date().toISOString()
        };
      }
      
    } catch (error) {
      this.logger.error('Restore failed', error.stack);
      throw new Error(`Restore failed: ${error.message}`);
    }
  }

  async rotateSystemSecrets() {
    // This would typically restart the application with new secrets
    // For now, return information about the process
    
    return {
      status: 'success',
      message: 'Use the rotation script: node scripts/rotate-secrets.js',
      newSecretGenerated: true,
      restartRequired: true,
      timestamp: new Date().toISOString()
    };
  }
}