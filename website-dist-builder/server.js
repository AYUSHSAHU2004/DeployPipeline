const {exec} = require('child_process')
const path = require('path')
const {fs}  = require('fs')
const {S3Client,PutObjectCommand} = require('@aws-sdk/client-s3')

const s3Client = new S3Client({
    region:'ap-south-1',
    credentials:{
        accessKeyId:'AKIAU6VTTTPDYKKPTRZ3',
        secretAccessKey:'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'
    }
})

const PROJECT_ID = process.env.PROJECT_ID

async function build() {
    const buildPath = path.join(__dirname,'output')

    const p = exec(`cd ${buildPath} && npm install && npm run build`)

    p.stdout.on('data',function(data){
        console.log(data.toString());
    })
    p.stdout.on('error',function(data){
        console.log(data.toString());
    })
    p.stdout.on('close',async function(data){
        console.log("BUILD COMPLETE");
        const distPath = path.join(__dirname,'output');
        const distFolderContents = fs.readdirSync(distPath,{recursive:true})

        for (const file of distFolderContents) {
            const filePath = path.join(distFolderPath, file)
            if (fs.lstatSync(filePath).isDirectory()) continue;
            const command = new PutObjectCommand({
                Bucket:'', 
                Key:`__outputs/${PROJECT_ID}/${file}`,
                Body:fs.createReadStream(filePath),
                ContentType:mime.lookup(filePath)
            })
            await s3Client.send(command)
            console.log("uploaded to s3");
        }
    })

}
build();