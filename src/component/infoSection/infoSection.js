import React from 'react';
import './infoSection.scss';

const InfoSection = (props) => {
    return (
        <div className='info-sec-wrapper'>
            {props.accountInfo
                .filter(info => info.page === props.currentPage)
                .map(
                    (info, key) => (<div className='info-sec' index={key} key={key}>
                        <div>
                            <img src={'images/board_icon.png'} style={{ marginRight: '7px' }} alt="" />
                            <div className='info-title'>{info.title}</div>
                        </div>
                        <div className={`info-amount${key + 1}`}>{info.amount}</div>
                    </div>)
                )
            }
        </div>
    )
}

export default InfoSection;