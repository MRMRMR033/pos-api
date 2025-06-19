# 🔐 MAPEO COMPLETO DE PERMISOS - FRONTEND UI

## 📊 **41 PERMISOS GRANULARES DEL SISTEMA**

### 🛍️ **MÓDULO VENTAS (7 permisos)**

| Permiso | Descripción | UI Elements | Componentes Afectados |
|---------|-------------|-------------|----------------------|
| `VENTAS_CREAR` | Crear nuevas ventas | ✅ Botón "Nueva Venta"<br/>✅ Form de checkout<br/>✅ Scanner código barras | VentasForm, Checkout, Scanner |
| `VENTAS_VER_PROPIAS` | Ver propias ventas | ✅ Lista de ventas del usuario<br/>✅ Detalles de tickets propios | VentasList (filtrada), TicketDetail |
| `VENTAS_VER_TODAS` | Ver todas las ventas | ✅ Lista completa de ventas<br/>✅ Filtros por vendedor<br/>✅ Detalles de cualquier ticket | VentasList (completa), VendedorFilter |
| `VENTAS_EDITAR` | Modificar ventas existentes | ✅ Botón "Editar"<br/>✅ Form de modificación<br/>✅ Recalcular totales | EditVentaForm, RecalcularBtn |
| `VENTAS_ELIMINAR` | Cancelar/eliminar ventas | ✅ Botón "Cancelar Venta"<br/>✅ Modal de confirmación | CancelarVentaBtn, ConfirmModal |
| `VENTAS_DESCUENTOS` | Aplicar descuentos | ✅ Campo descuento manual<br/>✅ Descuentos por item<br/>✅ Cupones | DescuentoField, CuponesList |
| `VENTAS_REEMBOLSOS` | Procesar reembolsos | ✅ Botón "Reembolso"<br/>✅ Form de reembolso | ReembolsoBtn, ReembolsoForm |

### 📦 **MÓDULO PRODUCTOS (8 permisos)**

| Permiso | Descripción | UI Elements | Componentes Afectados |
|---------|-------------|-------------|----------------------|
| `PRODUCTOS_VER` | Ver lista de productos | ✅ Catálogo de productos<br/>✅ Búsqueda por código/nombre | ProductosList, SearchBar |
| `PRODUCTOS_CREAR` | Agregar nuevos productos | ✅ Botón "Nuevo Producto"<br/>✅ Form de creación | AddProductoBtn, ProductoForm |
| `PRODUCTOS_EDITAR` | Modificar productos | ✅ Botón "Editar"<br/>✅ Form de edición<br/>✅ Cambio de precios | EditProductoBtn, ProductoForm |
| `PRODUCTOS_ELIMINAR` | Eliminar productos | ✅ Botón "Eliminar"<br/>✅ Modal de confirmación | DeleteBtn, ConfirmModal |
| `PRODUCTOS_PRECIOS` | Gestionar precios | ✅ Campos de precio<br/>✅ Precio especial<br/>✅ Historial de precios | PrecioFields, PrecioHistory |
| `PRODUCTOS_STOCK` | Gestionar inventario | ✅ Ajuste de stock<br/>✅ Stock mínimo<br/>✅ Alertas | StockAdjust, StockAlerts |
| `PRODUCTOS_CATEGORIAS` | Gestionar categorías | ✅ CRUD categorías<br/>✅ Asignación a productos | CategoriaForm, CategoriaSelect |
| `PRODUCTOS_IMPORTAR` | Importar productos masivos | ✅ Botón "Importar"<br/>✅ Upload CSV/Excel | ImportBtn, FileUpload |

### 💰 **MÓDULO CAJA (6 permisos)**

| Permiso | Descripción | UI Elements | Componentes Afectados |
|---------|-------------|-------------|----------------------|
| `CAJA_ABRIR` | Abrir turno de caja | ✅ Botón "Abrir Caja"<br/>✅ Form saldo inicial<br/>✅ Selección de caja | AbrirCajaBtn, SaldoInicialForm |
| `CAJA_CERRAR` | Cerrar turno de caja | ✅ Botón "Cerrar Caja"<br/>✅ Arqueo manual<br/>✅ Diferencias | CerrarCajaBtn, ArqueoForm |
| `CAJA_VER_PROPIAS` | Ver propios turnos | ✅ Historial personal<br/>✅ Turno actual | TurnoActual, HistorialPropio |
| `CAJA_VER_TODAS` | Ver todos los turnos | ✅ Historial completo<br/>✅ Filtros por usuario<br/>✅ Auditoría | HistorialCompleto, UsuarioFilter |
| `CAJA_MOVIMIENTOS` | Registrar movimientos | ✅ Ingresos/Egresos<br/>✅ Form movimientos<br/>✅ Conceptos | MovimientoForm, ConceptoSelect |
| `CAJA_CORTES` | Realizar cortes de caja | ✅ Corte parcial<br/>✅ Resumen de caja<br/>✅ Imprimir corte | CorteBtn, ResumenCaja |

### 🛒 **MÓDULO COMPRAS (5 permisos)**

| Permiso | Descripción | UI Elements | Componentes Afectados |
|---------|-------------|-------------|----------------------|
| `COMPRAS_CREAR` | Crear órdenes de compra | ✅ Botón "Nueva Orden"<br/>✅ Form orden compra<br/>✅ Selección productos | NuevaOrdenBtn, OrdenForm |
| `COMPRAS_VER` | Ver órdenes de compra | ✅ Lista de órdenes<br/>✅ Estados y filtros<br/>✅ Detalles | OrdenesList, EstadoFilter |
| `COMPRAS_EDITAR` | Modificar órdenes | ✅ Editar orden PENDIENTE<br/>✅ Cambiar cantidades | EditOrdenBtn, OrdenForm |
| `COMPRAS_ELIMINAR` | Eliminar órdenes | ✅ Eliminar orden PENDIENTE<br/>✅ Cancelar orden | DeleteOrdenBtn, CancelarBtn |
| `COMPRAS_RECIBIR` | Recibir mercancía | ✅ Botón "Recibir"<br/>✅ Form recepción<br/>✅ Ajuste cantidades | RecibirBtn, RecepcionForm |

### 🏢 **MÓDULO PROVEEDORES (4 permisos)**

| Permiso | Descripción | UI Elements | Componentes Afectados |
|---------|-------------|-------------|----------------------|
| `PROVEEDORES_VER` | Ver lista de proveedores | ✅ Lista proveedores<br/>✅ Información contacto | ProveedoresList, ContactInfo |
| `PROVEEDORES_CREAR` | Agregar proveedores | ✅ Botón "Nuevo Proveedor"<br/>✅ Form creación | NuevoProveedorBtn, ProveedorForm |
| `PROVEEDORES_EDITAR` | Modificar proveedores | ✅ Editar información<br/>✅ Condiciones pago | EditProveedorBtn, ProveedorForm |
| `PROVEEDORES_ELIMINAR` | Eliminar proveedores | ✅ Eliminar sin órdenes<br/>✅ Confirmación | DeleteProveedorBtn, ConfirmModal |

### 👥 **MÓDULO USUARIOS (6 permisos)**

| Permiso | Descripción | UI Elements | Componentes Afectados |
|---------|-------------|-------------|----------------------|
| `USUARIOS_VER` | Ver lista de usuarios | ✅ Lista empleados<br/>✅ Roles y estados | UsuariosList, RolBadge |
| `USUARIOS_CREAR` | Crear nuevos usuarios | ✅ Botón "Nuevo Usuario"<br/>✅ Form registro<br/>✅ Asignar rol | NuevoUsuarioBtn, RegistroForm |
| `USUARIOS_EDITAR` | Modificar usuarios | ✅ Editar perfil<br/>✅ Cambiar datos<br/>✅ Reset password | EditUsuarioBtn, PerfilForm |
| `USUARIOS_ELIMINAR` | Eliminar usuarios | ✅ Desactivar usuario<br/>✅ Confirmación | DesactivarBtn, ConfirmModal |
| `USUARIOS_PERMISOS` | Gestionar permisos | ✅ Asignar permisos<br/>✅ Matrix de permisos<br/>✅ Roles plantilla | PermisosMatrix, RolTemplate |
| `USUARIOS_SESIONES` | Ver sesiones activas | ✅ Sesiones activas<br/>✅ Cerrar sesiones<br/>✅ Auditoría login | SesionesActivas, LoginAudit |

### 📊 **MÓDULO REPORTES (4 permisos)**

| Permiso | Descripción | UI Elements | Componentes Afectados |
|---------|-------------|-------------|----------------------|
| `REPORTES_VENTAS` | Reportes de ventas | ✅ Dashboard ventas<br/>✅ Gráficos<br/>✅ Exportar | VentasDashboard, ChartsVentas |
| `REPORTES_INVENTARIO` | Reportes de inventario | ✅ Stock actual<br/>✅ Alertas stock<br/>✅ Movimientos | InventarioDashboard, StockAlerts |
| `REPORTES_FINANCIEROS` | Reportes financieros | ✅ Estado financiero<br/>✅ Flujo de caja<br/>✅ Rentabilidad | FinancieroDashboard, FlujoCaja |
| `REPORTES_AUDITORIA` | Reportes de auditoría | ✅ Logs del sistema<br/>✅ Acciones usuarios<br/>✅ Cambios datos | AuditoriaDashboard, LogsViewer |

### 🏪 **MÓDULO SUCURSALES (3 permisos)** *(Futuro)*

| Permiso | Descripción | UI Elements | Componentes Afectados |
|---------|-------------|-------------|----------------------|
| `SUCURSALES_VER` | Ver sucursales | ✅ Lista sucursales<br/>✅ Selector sucursal | SucursalesList, SucursalSelect |
| `SUCURSALES_GESTIONAR` | Administrar sucursales | ✅ CRUD sucursales<br/>✅ Configuración | SucursalForm, ConfigSucursal |
| `SUCURSALES_TRANSFERIR` | Transferir productos | ✅ Transferencias<br/>✅ Form transferencia | TransferForm, TransferList |

### ⚙️ **MÓDULO CONFIGURACIÓN (4 permisos)**

| Permiso | Descripción | UI Elements | Componentes Afectados |
|---------|-------------|-------------|----------------------|
| `CONFIG_SISTEMA` | Configuración general | ✅ Settings generales<br/>✅ Parámetros sistema | SettingsForm, SystemParams |
| `CONFIG_IMPUESTOS` | Configurar impuestos | ✅ CRUD impuestos<br/>✅ Porcentajes<br/>✅ Aplicación automática | ImpuestosForm, TaxConfig |
| `CONFIG_EMPRESA` | Datos de empresa | ✅ Información empresa<br/>✅ Logo<br/>✅ Documentos legales | EmpresaForm, LogoUpload |
| `CONFIG_BACKUP` | Gestión de backups | ✅ Crear backup<br/>✅ Restaurar<br/>✅ Programar | BackupForm, RestoreBtn |

---

## 🎨 **IMPLEMENTACIÓN EN UI COMPONENTS**

### **Hook de Permisos React**
```typescript
function usePermissions() {
  const { user } = useAuth();
  
  const hasPermission = (permission: string): boolean => {
    if (user?.rol === 'admin') return true;
    return user?.permissions?.includes(permission) ?? false;
  };
  
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(p => hasPermission(p));
  };
  
  return { hasPermission, hasAnyPermission };
}
```

### **Componente Condicional**
```typescript
function PermissionGuard({ permission, children, fallback = null }: {
  permission: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { hasPermission, hasAnyPermission } = usePermissions();
  
  const allowed = Array.isArray(permission) 
    ? hasAnyPermission(permission)
    : hasPermission(permission);
    
  return allowed ? <>{children}</> : <>{fallback}</>;
}
```

### **Uso en Componentes**
```typescript
function VentasScreen() {
  return (
    <div>
      <PermissionGuard permission="VENTAS_VER_TODAS">
        <VentasCompletas />
      </PermissionGuard>
      
      <PermissionGuard permission="VENTAS_VER_PROPIAS">
        <VentasPropias />
      </PermissionGuard>
      
      <PermissionGuard permission="VENTAS_CREAR">
        <Button onClick={handleNuevaVenta}>Nueva Venta</Button>
      </PermissionGuard>
    </div>
  );
}
```

---

## 🚦 **LÓGICA DE NAVEGACIÓN**

### **Menú Principal Dinámico**
```typescript
const menuItems = [
  {
    label: 'Ventas',
    path: '/ventas',
    permissions: ['VENTAS_VER_PROPIAS', 'VENTAS_VER_TODAS'],
    icon: 'shopping-cart'
  },
  {
    label: 'Productos',
    path: '/productos', 
    permissions: ['PRODUCTOS_VER'],
    icon: 'package'
  },
  {
    label: 'Caja',
    path: '/caja',
    permissions: ['CAJA_VER_PROPIAS', 'CAJA_VER_TODAS'],
    icon: 'dollar-sign'
  },
  {
    label: 'Reportes',
    path: '/reportes',
    permissions: ['REPORTES_VENTAS', 'REPORTES_INVENTARIO', 'REPORTES_FINANCIEROS'],
    icon: 'bar-chart'
  },
  {
    label: 'Administración',
    path: '/admin',
    permissions: ['USUARIOS_VER', 'CONFIG_SISTEMA'],
    icon: 'settings',
    adminOnly: true
  }
];
```

### **Protección de Rutas**
```typescript
function ProtectedRoute({ permission, children }: {
  permission: string | string[];
  children: React.ReactNode;
}) {
  const { hasPermission, hasAnyPermission } = usePermissions();
  const navigate = useNavigate();
  
  const allowed = Array.isArray(permission) 
    ? hasAnyPermission(permission)
    : hasPermission(permission);
    
  if (!allowed) {
    navigate('/unauthorized');
    return null;
  }
  
  return <>{children}</>;
}
```

## 📱 **UI RESPONSIVA POR PERMISOS**

Esta implementación garantiza que:
- ✅ **Botones** aparecen solo si hay permisos
- ✅ **Menús** se adaptan al rol del usuario
- ✅ **Formularios** muestran campos según permisos
- ✅ **Datos** se filtran automáticamente
- ✅ **Navegación** se bloquea en rutas no autorizadas

El sistema es completamente granular y permite un control preciso de la experiencia del usuario según sus permisos asignados.