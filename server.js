const http = require("http");
const fs = require('fs');
const host = 'localhost';
const port = 8000;


let fileline = '';

// from https://stackoverflow.com/questions/3393854/get-and-set-a-single-cookie-with-node-js-http-server#answer-3409200
function parseCookies (request) {
    const list = {};
    const cookieHeader = request.headers?.cookie;
    if (!cookieHeader) return list;

    cookieHeader.split(`;`).forEach(function(cookie) {
        let [ name, ...rest] = cookie.split(`=`);
        name = name?.trim();
        if (!name) return;
        const value = rest.join(`=`).trim();
        if (!value) return;
        list[name] = decodeURIComponent(value);
    });

    return list;
}






const requestListener = (req, res) => {

const user = {
    id: 123,
    username: 'testuser',
    password: 'qwerty'
};



const ifHasAuthCookies = (req, user) => {
    let cookies = parseCookies(req)
    if (cookies.authorized === 'true'
            && cookies.userId === user.id.toString()){
                return true;
            }
    return false;        
}
    


    if (req.url === '/delete') {
        if (req.method === 'DELETE') {
            res.writeHead(200);


            if (ifHasAuthCookies(req, user)) {

                let deleteFile = '';
                req.on('data', chunk => {
                    string = chunk.toString();
                    

                    const searchParams = new URLSearchParams(string);
                    for (const [key, value] of searchParams.entries()) {



                        if(key === 'filename')
                            deleteFile = `./files/${value}`;
                        
                    }


                    if (fs.existsSync(deleteFile)) {
                        fs.unlink(deleteFile, (err) => {
                            if (err) {
                                res.writeHead(500);
                                res.end('Did not unlink file' + err);
                                console.log(err);
                            }
                            
                            console.log('deleted');
                            res.end('success delete');
                        })
                    }
                    else {
                        res.writeHead(500);
                        res.end('No such file' + deleteFile);
                        console.log('No such file' + deleteFile);
                    }
                    
                });

            }

            
        } else {
            res.writeHead(405);
            res.end('HTTP method not allowed for /delete');
        }
    }



    else if (req.url === '/post') {
        if (req.method === 'POST') {
            

            if (ifHasAuthCookies(req, user)) {
                res.writeHead(200);
            
            
                let string = '';
                let filename = '';
                let content = '';

                req.on('data', chunk => {
                    string = chunk.toString();
                

                    const searchParams = new URLSearchParams(string);
                    for (const [key, value] of searchParams.entries()) {

                        
                        if(key === 'filename') {
                            
                            filename = value;
                        } 
                        
                        if(key === 'content')
                            content = value;
                    }

                    if(filename) {
                        fs.writeFile( `./files/${filename}`, content, (err) => {
                            if (err) {
                                res.writeHead(404);
                                console.log(err);
                                res.end('File write error' + err);  
                                
                            }
                            else {
                                console.log("File written successfully\n");
                                console.log("The written has the following contents:");
                                console.log(fs.readFileSync(`./files/${filename}`, "utf8"));
                                res.end(`???????? ./files/${filename} ??????????????`);  
                            } 
                        });
                    }
                    else {                           
                        res.writeHead(400);
                        res.end('???? ?????????????? ?????? ????????');
                    }

                });

                

            } 
            
            else {
                res.writeHead(200);
                res.end();
            }


            
        } else {
            res.writeHead(405);
            res.end('HTTP method not allowed for /post');
        }
    }



    else if (req.url === '/get') {
        if (req.method !== 'GET') {
            res.writeHead(405);
            res.end('HTTP method not allowed');
        } else {
            res.writeHead(200);
    
            filenames = fs.readdirSync('files')
    
            fileline = filenames.join(',');
    
       
            res.end(fileline);
        }
    }



    else if (req.url === '/redirect') {
        if (req.method === 'GET') {
            res.writeHead(302, { "Location": "/redirected" });
            return res.end();
        } else {
            res.writeHead(405);
            res.end('HTTP method not allowed for /redirect');
        }
    }



    else if (req.url === '/auth') {
        if (req.method === 'POST') {

            

            
            let string = '';
            let userTrue = false;
            let userPassTrue = false;
            req.on('data', chunk => {

                
                string = chunk.toString();

                const searchParams = new URLSearchParams(string);
                for (const [key, value] of searchParams.entries()) {

                    
                    
                    if(key === 'username' && value === user.username){
                        userTrue = true;
                    }
                    if(key === 'password' && value === user.password){
                        userPassTrue = true;
                    }
                }

                if(userTrue && userPassTrue){
                    console.log('user true');
                }

                
                if(userTrue && userPassTrue){
                    res.writeHead(200, {
                        'Content-Type': 'text/plain',
                        'Set-Cookie': [`userId=${user.id};MAX_AGE=172800;path=/;`,`authorized=true;MAX_AGE=172800;path=/;`]
                    })
                } else {
                    res.writeHead(200, {
                        'Content-Type': 'text/plain',
                        'Set-Cookie': [`userId=${user.id};expires=${new Date(0).toUTCString()};`, `authorized=false;expires=${new Date(0).toUTCString()}`]
                    });
                    //res.writeHead(400);
                    res.end('???????????????? ?????????? / ????????????');
                } 

                
                


            });

            req.on('end', () => {
                
                res.end('success auth request');
            });
            

            
        } else {
            res.writeHead(405);
            res.end('HTTP method not allowed');
        }
    }



    else if (req.url === '/redirected') {
        res.writeHead(200);
        res.end('redirected url');
    }



    else {
        res.writeHead(404);
        res.end('not found');
    }
};

const server = http.createServer(requestListener);

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});


