import mongoose from 'mongoose'

// Permitir que solo los campos definidos en el Schema sean almacenados
mongoose.set('strictQuery', true)

// Crear una funcion llamada connection()
const connection = async()=>{
    try {
        // Establecer la conexion con la BDD
        const {connection} = await mongoose.connect(process.env.MONGODB_URI)

        // Presentar la conexion en consola
        console.log(`Database is connected on ${connection.host} - ${connection.port}`)
    } catch (error) {
        // Capturar Error
        console.log(error);
    }
}

export default  connection