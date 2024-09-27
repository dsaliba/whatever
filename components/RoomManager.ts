import Pusher from 'pusher-js';


export default class RoomMagager {
    private pusher = new Pusher(process.env.NEXT_PUBLIC_APP_KEY, {
        cluster: process.env.NEXT_PUBLIC_APP_CLUSTER,
        channelAuthorization: {
            endpoint: '/api/user-auth',
            transport: "ajax"
          }
    });
    
    private currentChannel = undefined;
    private currentRoomCode : string = "";
    private binds: { (data): void; }[] = [];
    private memebersInfo = {};
    private membersInfoUpdatedCallback = (memberInfo)=>{};


 


    private generateRoomCode() : string {
        const codeCharacters : string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let code : string = "";
        for (var i = 0; i < 4; i++) {
            code += codeCharacters.charAt(Math.floor(Math.random()*codeCharacters.length))
        }
        return code;
    }


    public bind(callback : (data) => any ) {
        this.binds.push(callback);
    }

    public connectToRoom(code : string) {
        this.currentRoomCode = code;
        this.currentChannel = this.pusher.subscribe("presence-"+code);
        
        this.currentChannel.bind("pusher:subscription_error", function (e) {
            console.log(e)
          });

          this.currentChannel.bind("pusher:subscription_succeeded",  (memebers)=> {
            this.memebersInfo = memebers;
            console.log(memebers)
            this.membersInfoUpdatedCallback(this.memebersInfo);
          });

          this.currentChannel.bind("pusher:member_added", (member) => {
            //this.memebersInfo.members[member.id] = member.info;
            this.membersInfoUpdatedCallback(this.memebersInfo);
          });
        this.currentChannel.bind('client-message', (data)=> {
            this.binds.forEach((callback)=> {
                callback(data);
            })
        });
        

        // this.send({
        //     "name": "testname"
        // })
    }

    public getMemembersInfo() {
        return this.memebersInfo;
    }

    public bindMembersInfoUpdatedCallback(cb) {
        this.membersInfoUpdatedCallback = cb;
    }



    public createRoom() {
        //Impliment a timeout here
        let unique : boolean = false;
        let code : string = "";
        while(!unique) {
            code = this.generateRoomCode();
            unique = true;
            
            this.pusher.allChannels().forEach(channel => {
                if (channel.name === code) {
                    unique = false;
                }
            });
        }

        this.connectToRoom(code)
        console.log(code)

    }

    public send(data) {
        if (this.currentChannel !== undefined) {
            this.currentChannel.trigger('client-message', {message: data})
        }
        
    }

    public getRoomCode() : string {
        return this.currentRoomCode;
    }
}


