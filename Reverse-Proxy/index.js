const express = require('express')
const httpProxy = require('http-proxy')
const env = require('dotenv')

env.config()

const app = express()
const proxy = httpProxy.createProxy()
const BASE_PATH = process.env.BASE_PATH

app.use((req,res)=>{
    const hostname = req.hostname;
    const subDomain = hostname.split('.')[0];

    const resolvesTo = `${BASE_PATH}/${subDomain}`

    proxy.web(req,res,{target:resolvesTo,changeOrigin:true})
})

app.listen(process.env.PORT,()=>console.log(`Reverse Proxy Running..${process.env.PORT}`))