import fs from 'fs';
import crypto from 'crypto';
import zlib from 'zlib';

const main = () => {
    let username = process.argv.find(str => str.split('=')[0] === '--username').split('=')[1];
    console.log(`Welcome to the File Manager, ${username}!`);

    try {
      process.chdir(process.env.HOME);
      console.log('You are currently in ' + process.cwd());
    }
    catch (err) {
      console.log('chdir: ' + err);
    }

    let stdin = process.stdin;

    stdin.setEncoding('utf-8');

    stdin.on('data', (chunk) => {
        if(chunk.trim() === 'up') {
            process.chdir('..');
        } else
        if(chunk.trim().split(' ')[0] === 'cd') {
          const pathToDirectory = chunk.trim().split(' ').slice(1).join(' ');
          process.chdir(pathToDirectory);
        } else
        if(chunk.trim().split(' ')[0] === 'ls') {
          fs.readdir('./', (err, files) => {
            if(err) throw Error('FS operation failed');
            process.stdout.write(`| (index) | Name | Type |\n`)

            files.forEach((file, index) => {
                process.stdout.write(`| ${index} | ${file} | ${fs.lstatSync(file).isDirectory() ? 'directory' : 'file'} |\n`)
            })
        })
        } else
        if(chunk.trim().split(' ')[0] === 'cat') {
          const pathToFile = chunk.trim().split(' ')[1];
          fs.readFile(pathToFile,'utf-8', (err, data) => {
            console.log(data);
          })
        } else
        if(chunk.trim().split(' ')[0] === 'add') {
          const newFileName = chunk.trim().split(' ')[1];
          fs.readFile(newFileName, (err) => {
            if(err)
                fs.writeFile(newFileName, '', (err) => {
                })
            else
               throw Error('FS operation failed') 
          })
        } else
        if(chunk.trim().split(' ')[0] === 'rn') {
          const oldFileName = chunk.trim().split(' ')[1];
          const newFileName = chunk.trim().split(' ')[2];
          fs.rename(oldFileName, newFileName, (err) => {
            if (err)
                throw Error('FS operation failed');
          })
        } else
        if(chunk.trim().split(' ')[0] === 'cp') {
          const pathToFile = chunk.trim().split(' ')[1];
          const pathToNewDirectory = chunk.trim().split(' ')[2];
          const fileName = pathToFile.split(' ')[pathToFile.split(' ').length - 1];
          let stream = fs.createReadStream(pathToFile, 'utf-8');
          stream.on('data', (chunk) => {
            fs.createWriteStream(pathToNewDirectory + '/' + fileName).write(chunk).on('error', (err) => {
              console.log(err)
            });
          }).on('error', (err) => {
            console.log(err)
          })
        } else
        if(chunk.trim().split(' ')[0] === 'mv') {
          const pathToFile = chunk.trim().split(' ')[1];
          const pathToNewDirectory = chunk.trim().split(' ')[2];
          const fileName = pathToFile.split(' ')[pathToFile.split(' ').length - 1];
          fs.createReadStream(pathToFile, 'utf-8').on('data', (chunk) => {
            let stream = fs.createWriteStream(pathToNewDirectory+ '/' + fileName)
            stream.write(chunk)
            stream.on('error', (err) => {
              console.log(err)
            })
            fs.unlink(pathToFile, (err) => {
              if(err)
                  throw Error('FS operation failed');
            })
          }).on('error', (err) => {
            console.log(err)
          })
        } else
        if(chunk.trim().split(' ')[0] === 'rm') {
          const pathToFile = chunk.trim().split(' ')[1];
          fs.unlink(pathToFile, (err) => {
            if(err)
                throw Error('FS operation failed');
          })
        } else
        if(chunk.trim().split(' ')[0] === 'os' && chunk.trim().split(' ')[1] === '--EOL') {
          console.log(os.EOL)
        } else
        if(chunk.trim().split(' ')[0] === 'os' && chunk.trim().split(' ')[1] === '--cpus') {
          console.log(os.cpus())
        } else
        if(chunk.trim().split(' ')[0] === 'os' && chunk.trim().split(' ')[1] === '--homedir') {
          console.log(os.homedir())
        } else
        if(chunk.trim().split(' ')[0] === 'os' && chunk.trim().split(' ')[1] === '--username') {
          console.log(os.userInfo().username)
        } else
        if(chunk.trim().split(' ')[0] === 'os' && chunk.trim().split(' ')[1] === '--architecture') {
          console.log(os.arch())
        } else
        if(chunk.trim().split(' ')[0] === 'hash') {
          const pathToFile = chunk.trim().split(' ')[1];
          fs.readFile(pathToFile, 'utf-8', (err, data) => {
            if(err)
              console.log(err);
            console.log(crypto.createHash('sha256').update(data).digest('hex'));
          })
        } else
        if(chunk.trim().split(' ')[0] === 'compress') {
          const pathToFile = chunk.trim().split(' ')[1];
          const pathToNewDirectory = chunk.trim().split(' ')[2] || './';
          const fileName = pathToFile.split('/')[pathToFile.split('/').length - 1];

          fs.createReadStream(pathToFile, 'utf-8').on('data', (chunk) => {
            zlib.brotliCompress(chunk,{params: {
              [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT
              }}, (err, res) => {
                if(err) console.log(err)
                fs.createWriteStream(pathToNewDirectory + '/' + fileName + '.gz').on('error', (err) => console.log(err)).write(res.toString('base64'));
            })
          })
          .on('finish', () => {}).on('error', () => {})
        } else
        if(chunk.trim().split(' ')[0] === 'decompress') {
          const pathToFile = chunk.trim().split(' ')[1];
          const pathToNewDirectory = chunk.trim().split(' ')[2] || './';
          const fileName = pathToFile.split('/')[pathToFile.split('/').length - 1];

          fs.createReadStream(pathToFile, 'utf-8').on('data', (chunk) => {
            const compressedData = Buffer.from(chunk, 'base64');
            zlib.brotliDecompress(compressedData, (err, buffer) => {
              if(err) console.log(err) 
              else {
                fs.createWriteStream(pathToNewDirectory + '/' + (fileName.split('.').slice(0, -1)).join('.')).on('error', (err) => console.log(err)).write(buffer);
              }
            })
          }).on('finish', () => {}).on('error', () => {})
        }
        console.log('You are currently in ' + process.cwd());
    })

    process.on('SIGINT', () => {
        console.log(`Thank you for using File Manager, ${username}, goodbye!`)
        process.exit(0)
    })
}

main();