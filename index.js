import fs from 'fs'

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
          console.log(pathToDirectory);
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
          fs.readFile(pathToFile, (err, data) => {
            fs.writeFile(pathToNewDirectory, data, () => {});
          })
        } else
        if(chunk.trim().split(' ')[0] === 'mv') {
          const pathToFile = chunk.trim().split(' ')[1];
          const pathToNewDirectory = chunk.trim().split(' ')[2];
          fs.readFile(pathToFile, (err, data) => {
            fs.writeFile(pathToNewDirectory, data, () => {
              fs.unlink(pathToFile, (err) => {
                if(err)
                    throw Error('FS operation failed');
              })
            });
          })
        } else
        if(chunk.trim().split(' ')[0] === 'rm') {
          const pathToFile = chunk.trim().split(' ')[1];
          fs.unlink(pathToFile, (err) => {
            if(err)
                throw Error('FS operation failed');
          })
        }

        console.log('You are currently in ' + process.cwd());
    })

    process.on('SIGINT', () => {
        console.log(`Thank you for using File Manager, ${username}, goodbye!`)
        process.exit(0)
    })
}

main();