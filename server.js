```javascript                                                                   
  const express = require('express');                                           
  const http = require('http');                                                 
  const { Server } = require('socket.io');                                      
  const cors = require('cors');                                                 
  const path = require('path');                                                 
                                                                                
  const app = express();                                                        
  app.use(cors());                                                              
  app.use(express.static(path.join(__dirname, 'public')));                      
                                                                                
  const server = http.createServer(app);                                        
  const io = new Server(server, {                                               
      cors: { origin: "*" }                                                     
  });                                                                           
                                                                                
  let users = {};                                                               
  let channels = {                                                              
      'general': { name: 'General Chat', messages: [] },                        
      'toca-boca': { name: 'Toca Talk', messages: [] },                         
      'gaming': { name: 'Gaming Den', messages: [] }                            
  };                                                                            
                                                                                
  io.on('connection', (socket) => {                                             
      console.log('A user connected: ' + socket.id);                            
                                                                                
      socket.on('join', ({ username, channel }) => {                            
          socket.join(channel);                                                 
          users[socket.id] = { username, channel };                             
                                                                                
          // Notify others                                                      
          io.to(channel).emit('message', {                                      
              user: 'System',                                                   
              text: `${username} joined the chat! ✨`,                          
              color: '#ffc0cb'                                                  
          });                                                                   
      });                                                                       
                                                                                
      socket.on('send_message', (data) => {                                     
          const { channel, text, username, color } = data;                      
          io.to(channel).emit('message', { user: username, text, color });      
      });                                                                       
                                                                                
      socket.on('change_channel', ({ username, oldChannel, newChannel }) => {   
          socket.leave(oldChannel);                                             
          socket.join(newChannel);                                              
          users[socket.id] = { username, channel: newChannel };                 
                                                                                
          io.to(newChannel).emit('message', {                                   
              user: 'System',                                                   
              text: `${username} entered ${channels[newChannel]?.name ||        
newChannel}`,                                                                   
              color: '#ffc0cb'                                                  
          });                                                                   
      });                                                                       
                                                                                
      socket.on('disconnect', () => {                                           
          const user = users[socket.id];                                        
          if (user) {                                                           
              io.to(user.channel).emit('message', {                             
                  user: 'System',                                               
                  text: `${user.username} left the chat. 😭`,                   
                  color: '#ffc0cb'                                              
              });                                                               
              delete users[socket.id];                                          
          }                                                                     
      });                                                                       
  });                                                                           
                                                                                
  const PORT = process.env.PORT || 3000;                                        
  server.listen(PORT, () => {                                                   
      console.log(`Server running on port ${PORT}`);                            
  });                                                                           
```                                       
