
import React, { useCallback, useEffect, useState } from "react";
import dataManager from "../components/DataManager";
import { CardData, CardSwiper } from "react-card-swiper";

dataManager.init();

enum State {
  Landing,
  Lobby,
  Active
}

const IndexPage = () => {
  const [enteredCode, setEnteredCode] = useState("");
  const [currentState, setCurrentState] = useState(State.Landing)
  const [memberCount, setMemberCount] = useState(1);
  const [matchedResturant, setMatchedResturant] = useState(undefined);
  let lat = 0;
  let lon = 0;

  dataManager.bindMatchCallback(useCallback((resturant)=> {
    setMatchedResturant(resturant)
  },[matchedResturant]))

  dataManager.roomManager.bind(useCallback((data)=> {
    console.log(data)
    if (data.message.command === "start") {
      fetch(`https://api.geoapify.com/v2/places?categories=catering.restaurant&filter=circle:${data.message.data.lon},${data.message.data.lat},5000&bias=proximity:-71.807433,42.247125&limit=50&apiKey=${process.env.NEXT_PUBLIC_PLACES_KEY}`)
        .then(response => response.json())
        .then((result) => {
          dataManager.setResturants(result)
          setCurrentState(State.Active);
    })
        .catch(error => console.log('error', error));
      
    }
    if (data.message.command === "like") {
      dataManager.addLike(data.message.data, data.message.sender);
    }
  },[currentState]))

  dataManager.roomManager.bindMembersInfoUpdatedCallback(useCallback((data)=> {
    setMemberCount(data.count)
  },[memberCount]))

  useEffect(()=> {
    navigator.geolocation.getCurrentPosition((position) => {
          lon = position.coords.longitude;
          lat = position.coords.latitude;
           

          });
  });
  

  return (
  <div className="main-container">
    {matchedResturant===undefined?<></>:<div className="match-container">
    <div className="match">
      <div className="match-text">
                        Match!
                        </div>
      <div className="resturant-name">
                        {matchedResturant.properties.name}
                        </div>
                        <div className="resturant-distance">
                            {Number(matchedResturant.properties.distance * 0.0006213712).toFixed(1)} Miles
                          </div>
                    </div>
                    </div>
                    }
    <div className="top-bar">
      Whatever
    </div>
    {
      (()=>{
        switch(currentState) {
          case State.Landing:
            return (
              
              <div className="menu-items">
      
              <input className="input-box" value={enteredCode} onChange={(e)=> {
                const codeCharacters : string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                let value = e.target.value.toUpperCase();
                if (value.length > 0) {
                  if (!codeCharacters.includes(value.charAt(value.length-1))) {
                    value = value.substring(0, value.length-1)
                  }
                  if (value.length > 4) {
                      value = value.substring(0, 4);
                  }
                }
                setEnteredCode(value);
              }}>
              
              </input>
            <button className="join-button" onClick={()=> {
              if (enteredCode.length === 4) {
                dataManager.roomManager.connectToRoom(enteredCode);
                setCurrentState(State.Lobby);
              }
            }}>
              Join
            </button>
      
            <div className="or-box">
              OR
            </div>
      
            <button className="host-button" onClick={()=> {
              dataManager.roomManager.createRoom();
              setCurrentState(State.Lobby);
            }}>
              Host
            </button>
      
      
          </div>
            )
            case State.Lobby:
              return (
                <div className="center-container">
                <div className="lobby-items">
                    <div className="count-circle">
                      <div>
                        {memberCount}
                        </div>
                      </div>

                      <button className="start-button" onClick={()=> {
                         fetch(`https://api.geoapify.com/v2/places?categories=catering.restaurant&filter=circle:${lon},${lat},5000&bias=proximity:-71.807433,42.247125&limit=50&apiKey=${process.env.NEXT_PUBLIC_PLACES_KEY}`)
                         .then(response => response.json())
                         .then((result) => {dataManager.setResturants(result)
                          setCurrentState(State.Active);
                        dataManager.roomManager.send({
                          "command" : "start",
                          "data": {
                            "lat":  lat,
                            "lon": lon,
                          }
                        })
                         })
                         .catch(error => console.log('error', error));
                        
            }}>
              Start
            </button>
                  </div>
                  <div className="bottom-bar">
      {dataManager.roomManager.getRoomCode()}
    </div>
</div>
                  
                  
              )
              case State.Active:
                return (
                  <div className="card-container">
      <CardSwiper
        data={(():CardData[]=>{
          const data = [];
          dataManager.resturants.features.forEach(element => {
              data.push(
                {
                  id: element.properties.place_id,
                  content: <div className="card">
                      <div className="resturant-name">
                        {element.properties.name}
                        </div>
                        <div className="resturant-distance">
                            {Number(element.properties.distance * 0.0006213712).toFixed(1)} Miles
                          </div>
                    </div>
                }
              )
          });
          return (
            data
          );
        })()}
        onDismiss={(el, meta, id, action, operation) => {
          if (action === "like") {
            dataManager.addLike(id, dataManager.roomManager.getMemembersInfo().me.id);
            dataManager.roomManager.send({
              "command" : "like",
              "sender": dataManager.roomManager.getMemembersInfo().me.id,
              "data": id
            })
          }
        }}
        withActionButtons
        withRibbons
        likeRibbonText="Sure"
        dislikeRibbonText="Nah"
        ribbonColors={{ bgLike: '#9ECE6A', bgDislike: '#F7768E', textColor: '#1A1B26' }}
        emptyState={
          <div>
              done
            </div>
        }
      />
      </div>
                )
        }
      })()
    }
   
    
  </div>
)
};


export default IndexPage;
