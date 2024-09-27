import RoomMagager from "../components/RoomManager";



class DataManager {
    public roomManager = new RoomMagager();
    public resturants = {};
    public likes = {};
    private matchCallback = (resturant)=>{};
    
    public init() {
        
        this.roomManager.bindMembersInfoUpdatedCallback(function(members) {
            console.log(members);
        })
    }

    public bindMatchCallback(callback) {
        this.matchCallback = callback;
    }

    

    public setResturants(data) {
        this.resturants = data;
    }

    public addLike(resturant, user) {
        if (resturant in this.likes) {
            if (!dataManager.likes[resturant].includes(user)) {
                dataManager.likes[resturant].push(user)
            }
            
          } else {
            dataManager.likes[resturant] = [user]
          }
          // @ts-ignore
          if (dataManager.likes[resturant].length >= this.roomManager.getMemembersInfo().count) {
            console.log("Match!")
            // @ts-ignore
            this.resturants.businesses.forEach(element => {
                if (resturant === element.id) {
                    this.matchCallback(element);
                    return;
                }
            });
        }
          console.log(dataManager.likes)
    }

}

const dataManager = new DataManager();
export default dataManager;