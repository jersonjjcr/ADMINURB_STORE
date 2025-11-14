import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const createUser = async () => {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Verificar si ya existe un usuario
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('⚠️  Ya existe un usuario en el sistema.');
      const confirm = await question('¿Deseas crear otro usuario de todas formas? (s/n): ');
      if (confirm.toLowerCase() !== 's') {
        console.log('Operación cancelada.');
        process.exit(0);
      }
    }

    console.log('=== CREAR USUARIO ADMINISTRADOR ===\n');
    
    const name = await question('Nombre completo: ');
    const email = await question('Email: ');
    const password = await question('Contraseña (mínimo 6 caracteres): ');

    if (!name || !email || !password) {
      console.error('❌ Todos los campos son obligatorios');
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('❌ La contraseña debe tener al menos 6 caracteres');
      process.exit(1);
    }

    // Crear usuario
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'admin'
    });

    console.log('\n✅ Usuario creado exitosamente!');
    console.log('\n📝 Detalles del usuario:');
    console.log(`   Nombre: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log('\n🔐 Ahora puedes iniciar sesión con estas credenciales.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createUser();
