import User from '../models/User.js';

export const initializeDefaultUser = async () => {
  try {
    // Verificar si ya existe un usuario
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      // Crear usuario por defecto
      const defaultUser = await User.create({
        name: 'Administrador',
        email: 'Admin',
        password: 'Admin',
        role: 'admin'
      });
      
      console.log('✅ Usuario por defecto creado:');
      console.log('   Email: Admin');
      console.log('   Password: Admin');
    }
  } catch (error) {
    console.error('Error creando usuario por defecto:', error.message);
  }
};
