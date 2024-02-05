import logoDog from '../assets/dog-hand.webp'
import { Link } from 'react-router-dom'
import Mensaje from '../componets/Alertas/Mensaje'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import axios from 'axios';


const Restablecer = () => {
    const { token } = useParams();
    const [mensaje, setMensaje] = useState({})
		const [tokenback, setTokenBack] = useState(false)
    
		const verifyToken = async()=>{
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/recuperar-password/${token}`
            const respuesta = await axios.get(url)
						setTokenBack(true)
            setMensaje({respuesta:respuesta.data.msg,tipo:true})
        } catch (error) {
            setMensaje({respuesta:error.response.data.msg,tipo:false})
        }
    }
    useEffect(() => {
        verifyToken()
    }, [])


    return (
        <div className="flex flex-col items-center justify-center">

            <img className="object-cover h-80 w-80 rounded-full border-4 border-solid border-slate-600" src={logoDog} alt="image description" />

            <div className="flex flex-col items-center justify-center">
                {Object.keys(mensaje).length>0 && <Mensaje tipo={mensaje.tipo}>{mensaje.respuesta}</Mensaje>}
                <p className="md:text-lg lg:text-xl text-gray-600 mt-8">Ya puedes iniciar sesión</p>
                <Link to="/login" className="p-3 m-5 w-full text-center bg-gray-600 text-slate-300 border rounded-xl hover:scale-110 duration-300 hover:bg-gray-900 hover:text-white">Login</Link>
            </div>

        </div>
    )
}

export default Restablecer
