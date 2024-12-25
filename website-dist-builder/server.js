const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: '',
        secretAccessKey: ''
    }
});

const PROJECT_ID = process.env.PROJECT_ID;

async function build() {
    const buildPath = path.join(__dirname, 'output'); // This is where your project is cloned

    const p = exec(`cd ${buildPath} && npm install && npm run build`);

    p.stdout.on('data', function (data) {
        console.log(data.toString());
    });

    p.stderr.on('data', function (data) {
        console.error(data.toString());
    });

    p.on('close', async function (code) {
        if (code !== 0) {
            console.error(`Build process failed with code ${code}`);
            process.exit(1); // Exit with an error code if build fails
        }

        console.log("BUILD COMPLETE");
        const distPath = path.join(__dirname, 'output', 'dist'); // Assuming 'dist' is where build output is placed
        const distFolderContents = fs.readdirSync(distPath, { recursive: true });

        try {
            for (const file of distFolderContents) {
                const filePath = path.join(distPath, file);
                if (fs.lstatSync(filePath).isDirectory()) continue;

                const command = new PutObjectCommand({
                    Bucket: 'host-my-domain', 
                    Key: `__outputs/${PROJECT_ID}/${file}`,
                    Body: fs.createReadStream(filePath),
                    ContentType: mime.lookup(filePath)
                });

                await s3Client.send(command);
                console.log(`Uploaded ${file} to S3`);
            }

            console.log("All files uploaded to S3. Stopping the container.");
            process.exit(0); // Exit gracefully after successful uploads
        } catch (err) {
            console.error("Error during S3 upload:", err);
            process.exit(1); // Exit with an error code if upload fails
        }
    });
}

build();
