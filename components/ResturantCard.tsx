import React, { Dispatch, SetStateAction } from 'react'
import Image from 'next/image'

interface Props {
  data : any
}

const ResturantCard = (props: Props) => {
    let starName = Math.floor(Math.round(props.data.rating*2)/2) + (Math.round(props.data.rating*2)%2===1?"_half":"")
  return (
    
    <div className="card">
                      <img src={props.data.image_url} className="card-image"/>
                      <div className="resturant-name">
                        {props.data.name}
                        </div>

                        <img src={`/stars/Review_Ribbon_medium_20_${starName}@1x.png`}/>
                        <div className='review-count'>
                            {props.data.review_count} Reviews 
                        </div>
                        {props.data.price!==undefined?<div className='resturant-price'>
                            {props.data.price}
                        </div>:<></>}
                        <div className="resturant-distance">
                            {Number(props.data.distance * 0.0006213712).toFixed(1)} Miles
                          </div>
                            <a className="yelp" href={props.data.url}>
                            <img  src={`/yelp.svg`} />

                            </a>
                          
                    </div>
  )
}

export default ResturantCard