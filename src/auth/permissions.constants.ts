export const PERMISSIONS = {
  // PRODUCTOS
  PRODUCTOS_VER: 'productos:ver',
  PRODUCTOS_VER_PRECIO_COSTO: 'productos:ver_precio_costo',
  PRODUCTOS_VER_PRECIO_VENTA: 'productos:ver_precio_venta',
  PRODUCTOS_CREAR: 'productos:crear',
  PRODUCTOS_EDITAR: 'productos:editar',
  PRODUCTOS_ELIMINAR: 'productos:eliminar',
  PRODUCTOS_VER_STOCK: 'productos:ver_stock',
  PRODUCTOS_AJUSTAR_STOCK: 'productos:ajustar_stock',

  // VENTAS
  VENTAS_CREAR: 'ventas:crear',
  VENTAS_VER_PROPIAS: 'ventas:ver_propias',
  VENTAS_VER_TODAS: 'ventas:ver_todas',
  VENTAS_CANCELAR: 'ventas:cancelar',
  VENTAS_APLICAR_DESCUENTO: 'ventas:aplicar_descuento',
  VENTAS_EDITAR: 'ventas:editar',
  VENTAS_ELIMINAR: 'ventas:eliminar',

  // CAJA
  CAJA_ABRIR: 'caja:abrir',
  CAJA_CERRAR: 'caja:cerrar',
  CAJA_VER_MOVIMIENTOS: 'caja:ver_movimientos',
  CAJA_VER_MOVIMIENTOS_TODOS: 'caja:ver_movimientos_todos',
  CAJA_REGISTRAR_ENTRADA: 'caja:registrar_entrada',
  CAJA_REGISTRAR_SALIDA: 'caja:registrar_salida',

  // REPORTES
  REPORTES_VENTAS_DIA: 'reportes:ventas_dia',
  REPORTES_VENTAS_PERIODO: 'reportes:ventas_periodo',
  REPORTES_INVENTARIO: 'reportes:inventario',
  REPORTES_FINANCIEROS: 'reportes:financieros',

  // CATEGORÍAS
  CATEGORIAS_VER: 'categorias:ver',
  CATEGORIAS_CREAR: 'categorias:crear',
  CATEGORIAS_EDITAR: 'categorias:editar',
  CATEGORIAS_ELIMINAR: 'categorias:eliminar',

  // PROVEEDORES
  PROVEEDORES_VER: 'proveedores:ver',
  PROVEEDORES_CREAR: 'proveedores:crear',
  PROVEEDORES_EDITAR: 'proveedores:editar',
  PROVEEDORES_ELIMINAR: 'proveedores:eliminar',

  // USUARIOS
  USUARIOS_VER_TODOS: 'usuarios:ver_todos',
  USUARIOS_VER_PROPIO: 'usuarios:ver_propio',
  USUARIOS_CREAR: 'usuarios:crear',
  USUARIOS_EDITAR: 'usuarios:editar',
  USUARIOS_ELIMINAR: 'usuarios:eliminar',
  USUARIOS_GESTIONAR_PERMISOS: 'usuarios:gestionar_permisos',

  // SESIONES
  SESIONES_VER_PROPIAS: 'sesiones:ver_propias',
  SESIONES_VER_TODAS: 'sesiones:ver_todas',
} as const;

export const PERMISSION_DESCRIPTIONS = {
  [PERMISSIONS.PRODUCTOS_VER]: 'Ver productos',
  [PERMISSIONS.PRODUCTOS_VER_PRECIO_COSTO]: 'Ver precio de costo de productos',
  [PERMISSIONS.PRODUCTOS_VER_PRECIO_VENTA]: 'Ver precio de venta de productos',
  [PERMISSIONS.PRODUCTOS_CREAR]: 'Crear productos',
  [PERMISSIONS.PRODUCTOS_EDITAR]: 'Editar productos',
  [PERMISSIONS.PRODUCTOS_ELIMINAR]: 'Eliminar productos',
  [PERMISSIONS.PRODUCTOS_VER_STOCK]: 'Ver niveles de stock',
  [PERMISSIONS.PRODUCTOS_AJUSTAR_STOCK]: 'Ajustar inventario',

  [PERMISSIONS.VENTAS_CREAR]: 'Crear ventas',
  [PERMISSIONS.VENTAS_VER_PROPIAS]: 'Ver sus propias ventas',
  [PERMISSIONS.VENTAS_VER_TODAS]: 'Ver todas las ventas',
  [PERMISSIONS.VENTAS_CANCELAR]: 'Cancelar ventas',
  [PERMISSIONS.VENTAS_APLICAR_DESCUENTO]: 'Aplicar descuentos',
  [PERMISSIONS.VENTAS_EDITAR]: 'Editar ventas',
  [PERMISSIONS.VENTAS_ELIMINAR]: 'Eliminar ventas',

  [PERMISSIONS.CAJA_ABRIR]: 'Abrir caja',
  [PERMISSIONS.CAJA_CERRAR]: 'Cerrar caja',
  [PERMISSIONS.CAJA_VER_MOVIMIENTOS]: 'Ver movimientos de caja propios',
  [PERMISSIONS.CAJA_VER_MOVIMIENTOS_TODOS]: 'Ver todos los movimientos de caja',
  [PERMISSIONS.CAJA_REGISTRAR_ENTRADA]: 'Registrar entradas de dinero',
  [PERMISSIONS.CAJA_REGISTRAR_SALIDA]: 'Registrar salidas de dinero',

  [PERMISSIONS.REPORTES_VENTAS_DIA]: 'Ver reporte de ventas del día',
  [PERMISSIONS.REPORTES_VENTAS_PERIODO]: 'Ver reportes de ventas por período',
  [PERMISSIONS.REPORTES_INVENTARIO]: 'Ver reportes de inventario',
  [PERMISSIONS.REPORTES_FINANCIEROS]: 'Ver reportes financieros',

  [PERMISSIONS.CATEGORIAS_VER]: 'Ver categorías',
  [PERMISSIONS.CATEGORIAS_CREAR]: 'Crear categorías',
  [PERMISSIONS.CATEGORIAS_EDITAR]: 'Editar categorías',
  [PERMISSIONS.CATEGORIAS_ELIMINAR]: 'Eliminar categorías',

  [PERMISSIONS.PROVEEDORES_VER]: 'Ver proveedores',
  [PERMISSIONS.PROVEEDORES_CREAR]: 'Crear proveedores',
  [PERMISSIONS.PROVEEDORES_EDITAR]: 'Editar proveedores',
  [PERMISSIONS.PROVEEDORES_ELIMINAR]: 'Eliminar proveedores',

  [PERMISSIONS.USUARIOS_VER_TODOS]: 'Ver todos los usuarios',
  [PERMISSIONS.USUARIOS_VER_PROPIO]: 'Ver perfil propio',
  [PERMISSIONS.USUARIOS_CREAR]: 'Crear usuarios',
  [PERMISSIONS.USUARIOS_EDITAR]: 'Editar usuarios',
  [PERMISSIONS.USUARIOS_ELIMINAR]: 'Eliminar usuarios',
  [PERMISSIONS.USUARIOS_GESTIONAR_PERMISOS]: 'Gestionar permisos de usuarios',

  [PERMISSIONS.SESIONES_VER_PROPIAS]: 'Ver sesiones propias',
  [PERMISSIONS.SESIONES_VER_TODAS]: 'Ver todas las sesiones',
} as const;

export const PERMISSION_MODULES = {
  PRODUCTOS: 'productos',
  VENTAS: 'ventas',
  CAJA: 'caja',
  REPORTES: 'reportes',
  CATEGORIAS: 'categorias',
  PROVEEDORES: 'proveedores',
  USUARIOS: 'usuarios',
  SESIONES: 'sesiones',
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;
export type PermissionValue = typeof PERMISSIONS[PermissionKey];