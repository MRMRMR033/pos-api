#!/usr/bin/env node
/**
 * Script para rotar JWT_SECRET y otras claves sensibles
 * Uso: node scripts/rotate-secrets.js [--env=production]
 */

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

function generateJWTSecret() {
  return crypto.randomBytes(64).toString('hex');
}

function rotateSecrets(envFile = '.env') {
  const envPath = path.join(process.cwd(), envFile);
  
  if (!fs.existsSync(envPath)) {
    console.error(`❌ Archivo ${envFile} no encontrado`);
    process.exit(1);
  }

  // Leer archivo .env actual
  const envContent = fs.readFileSync(envPath, 'utf8');
  let lines = envContent.split('\n');

  // Generar nuevos secretos
  const newJWTSecret = generateJWTSecret();
  const timestamp = new Date().toISOString();

  // Actualizar líneas
  let updated = false;
  lines = lines.map(line => {
    if (line.startsWith('JWT_SECRET=')) {
      updated = true;
      return `JWT_SECRET="${newJWTSecret}"`;
    }
    return line;
  });

  // Si no existe JWT_SECRET, agregarlo
  if (!updated) {
    lines.push(`JWT_SECRET="${newJWTSecret}"`);
  }

  // Agregar comentario con timestamp
  lines.push(`# Secrets rotated at: ${timestamp}`);

  // Crear backup del archivo anterior
  const backupPath = `${envPath}.backup.${Date.now()}`;
  fs.copyFileSync(envPath, backupPath);
  console.log(`✅ Backup creado: ${backupPath}`);

  // Escribir nuevo archivo
  fs.writeFileSync(envPath, lines.join('\n'));
  console.log(`✅ JWT_SECRET rotado exitosamente`);
  console.log(`🔑 Nuevo JWT_SECRET: ${newJWTSecret.substring(0, 16)}...`);
  
  return {
    newJWTSecret,
    backupPath,
    timestamp
  };
}

function generateStationConfig(stationId) {
  const config = `# Configuración para Estación ${stationId}
# Generado: ${new Date().toISOString()}

# Base de datos (ajustar según estación)
DATABASE_URL="postgresql://pos_user:pos_password@localhost:5432/pos_station_${stationId}"

# JWT Secret único por estación
JWT_SECRET="${generateJWTSecret()}"

# Configuración de estación
STATION_ID="${stationId}"
STATION_NAME="Caja ${stationId}"
NODE_ENV="production"

# Puerto único por estación
PORT=${3000 + stationId}

# Configuración de logging
LOG_LEVEL="info"
LOG_FILE="logs/station_${stationId}.log"

# Configuración de backup
BACKUP_RETENTION_DAYS=30
BACKUP_SCHEDULE="0 2 * * *"
`;

  const fileName = `.env.station${stationId}`;
  fs.writeFileSync(fileName, config);
  console.log(`✅ Configuración de estación ${stationId} creada: ${fileName}`);
  
  return fileName;
}

// CLI
const args = process.argv.slice(2);
const envArg = args.find(arg => arg.startsWith('--env='));
const stationArg = args.find(arg => arg.startsWith('--station='));

if (stationArg) {
  const stationId = stationArg.split('=')[1];
  generateStationConfig(parseInt(stationId));
} else {
  const envFile = envArg ? envArg.split('=')[1] + '.env' : '.env';
  rotateSecrets(envFile);
}