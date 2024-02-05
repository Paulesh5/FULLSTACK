import Veterinario from "../models/Veterinario.js"

import { sendMailToUser, sendMailToRecoveryPassword } from "../config/nodemailer.js"

import generarJWT from "../helpers/crearJWT.js"

import mongoose from "mongoose";


// Metodo para el login
const login = async(req,res)=>{
    const {email,password} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const veterinarioBDD = await Veterinario.findOne({email}).select("-status -__v -token -updatedAt -createdAt")
    if(veterinarioBDD?.confirmEmail===false) return res.status(403).json({msg:"Lo sentimos, debe verificar su cuenta"})
    if(!veterinarioBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})
    const verificarPassword = await veterinarioBDD.matchPassword(password)
    if(!verificarPassword) return res.status(404).json({msg:"Lo sentimos, el password no es el correcto"})
    const token = generarJWT(veterinarioBDD._id,"veterinario")
    const {nombre,apellido,direccion,telefono,_id} = veterinarioBDD
    res.status(200).json({
        token,
        nombre,
        apellido,
        direccion,
        telefono,
        _id,
        email:veterinarioBDD.email
    })
}
// Metodo para mostrar el perfil
const perfil =(req,res)=>{
    delete req.veterinarioBDD.token
    delete req.veterinarioBDD.confirmEmail
    delete req.veterinarioBDD.createdAt
    delete req.veterinarioBDD.updatedAt
    delete req.veterinarioBDD.__v
    res.status(200).json(req.veterinarioBDD)
}
// Metodo para el registro
const registro =async (req,res)=>{
    // Desestructura los campos
    const {email,password} = req.body
    // Validar todos los campos llenos
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    // Obtener el usuario de la BDD en base al email
    const verificarEmailBDD = await Veterinario.findOne({email})
    // Validar que el email sea nuevo
    if(verificarEmailBDD) return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"})
    // Crear una instancia del veterinario
    const nuevoVeterinario = new Veterinario(req.body)
    // Encriptar el password
    nuevoVeterinario.password = await nuevoVeterinario.encrypPassword(password)
    // Crear el token => mail
    const token = nuevoVeterinario.crearToken()
    await sendMailToUser(email,token)
    // Guardar en base de datos
    await nuevoVeterinario.save()
    // Responder
    res.status(200).json({msg:"Revisa tu correo electrónico para confirmar tu cuenta"})
}
// Metodo para confirmar el token
const confirmEmail = async (req,res)=>{
    if(!(req.params.token)) return res.status(400).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    const veterinarioBDD = await Veterinario.findOne({token:req.params.token})
    if(!veterinarioBDD?.token) return res.status(404).json({msg:"La cuenta ya ha sido confirmada"})
    veterinarioBDD.token = null
    veterinarioBDD.confirmEmail=true
    await veterinarioBDD.save()
    res.status(200).json({msg:"Token confirmado, ya puedes iniciar sesión"}) 
}
// Metodo para listar veterinarios
const listarVeterinarios = (req,res)=>{
    res.status(200).json({res:'lista de veterinarios registrados'})
}
// Metodo para mostrar el detalle d un veterinario en particular
const detalleVeterinario = async(req,res)=>{
    const {id} = req.params
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, debe ser un id válido`});
    const veterinarioBDD = await Veterinario.findById(id).select("-password")
    if(!veterinarioBDD) return res.status(404).json({msg:`Lo sentimos, no existe el veterinario ${id}`})
    res.status(200).json({msg:veterinarioBDD})
}
// Metodo para actualizar el perfil
const actualizarPerfil = async (req,res)=>{
    const {id} = req.params
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, debe ser un id válido`});
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const veterinarioBDD = await Veterinario.findById(id)
    if(!veterinarioBDD) return res.status(404).json({msg:`Lo sentimos, no existe el veterinario ${id}`})
    if (veterinarioBDD.email !=  req.body.email)
    {
        const veterinarioBDDMail = await Veterinario.findOne({email:req.body.email})
        if (veterinarioBDDMail)
        {
            return res.status(404).json({msg:`Lo sentimos, el existe ya se encuentra registrado`})  
        }
    }
		veterinarioBDD.nombre = req.body.nombre || veterinarioBDD?.nombre
    veterinarioBDD.apellido = req.body.apellido  || veterinarioBDD?.apellido
    veterinarioBDD.direccion = req.body.direccion ||  veterinarioBDD?.direccion
    veterinarioBDD.telefono = req.body.telefono || veterinarioBDD?.telefono
    veterinarioBDD.email = req.body.email || veterinarioBDD?.email
    await veterinarioBDD.save()
    res.status(200).json({msg:"Perfil actualizado correctamente"})
}
// Metodo para actualizar el password
const actualizarPassword = async (req,res)=>{
    const veterinarioBDD = await Veterinario.findById(req.veterinarioBDD._id)
    if(!veterinarioBDD) return res.status(404).json({msg:`Lo sentimos, no existe el veterinario ${id}`})
    const verificarPassword = await veterinarioBDD.matchPassword(req.body.passwordactual)
    if(!verificarPassword) return res.status(404).json({msg:"Lo sentimos, el password actual no es el correcto"})
    veterinarioBDD.password = await veterinarioBDD.encrypPassword(req.body.passwordnuevo)
    await veterinarioBDD.save()
    res.status(200).json({msg:"Password actualizado correctamente"})
}
// Metodo para recuperar el password
const recuperarPassword = async(req,res)=>{
    const {email} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const veterinarioBDD = await Veterinario.findOne({email})
    if(!veterinarioBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})
    const token = veterinarioBDD.crearToken()
    veterinarioBDD.token=token
    await sendMailToRecoveryPassword(email,token)
    await veterinarioBDD.save()
    res.status(200).json({msg:"Revisa tu correo electrónico para reestablecer tu cuenta"})
}
// Metodo para comprobar el token
const comprobarTokenPasword = async (req,res)=>{
    if(!(req.params.token)) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    const veterinarioBDD = await Veterinario.findOne({token:req.params.token})
    if(veterinarioBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    await veterinarioBDD.save()
    res.status(200).json({msg:"Token confirmado, ya puedes crear tu nuevo password"}) 
}
// Metodo para crear el nuevo password
const nuevoPassword = async (req,res)=>{
    const{password,confirmpassword} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    if(password != confirmpassword) return res.status(404).json({msg:"Lo sentimos, los passwords no coinciden"})
    const veterinarioBDD = await Veterinario.findOne({token:req.params.token})
    if(veterinarioBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    veterinarioBDD.token = null
    veterinarioBDD.password = await veterinarioBDD.encrypPassword(password)
    await veterinarioBDD.save()
    res.status(200).json({msg:"Felicitaciones, ya puedes iniciar sesión con tu nuevo password"}) 
}

// Exportar cada uno de los metodos
export {
    login,
    perfil,
    registro,
    confirmEmail,
    listarVeterinarios,
    detalleVeterinario,
    actualizarPerfil,
    actualizarPassword,
	recuperarPassword,
    comprobarTokenPasword,
	nuevoPassword
}