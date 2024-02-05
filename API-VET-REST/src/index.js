import app from './server.js'
// Importar la funcion connection()
import connection from './database.js';

// Haciendo uso de la funcion connection
connection()

app.listen(app.get('port'),()=>{
    console.log(`Server ok on http://localhost:${app.get('port')}`);
})