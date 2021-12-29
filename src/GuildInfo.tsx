import { createRef, useEffect, useState } from "react";
import CreateChannel from "./CreateChannel";
import EditNickname from "./EditNickname";
import { Guild } from './interfaces';

function GuildInfo(props: any) {

   const infoRef = createRef<HTMLDivElement>();
   const createChannelRef = createRef<HTMLDivElement>();
   const editNicknameRef = createRef<HTMLDivElement>();

   const [guildName, setGuildName] = useState('');
   const [isOwner, setIsOwner] = useState(true);
   const [canInvite, setCanInvite] = useState(false);
   const [canAddChannel, setCanAddChannel] = useState(false);
   const [canChangeNickname, setCanChangeNickname] = useState(false);
   const [canManage, setCanManage] = useState(false);
   const [showInfo, setShowInfo] = useState(false);
   const [notOnWait, setNotOnWait] = useState(true);
   const [createChannel, setCreateChannel] = useState(false);
   const [editNickname, setEditNickname] = useState(false);

   useEffect(() => {
      fetch(props.domain + '/guilds/' + props.guild, {
        headers: new Headers({
          'Authorization': localStorage.getItem('token') ?? ''
        })
      })
      .then(res => res.json())
      .then((result: Guild) => {
       setGuildName(result.name);
       setIsOwner(result.members.find(x => x?.id === props.user)?.roles.includes("0") ?? false);
       setCanInvite(result.members.find(x => x?.id === props.user)?.roles.map(role => ((result.roles.find(x => x?.id === role)?.permissions ?? 0) & 0x0000000001) === 0x0000000001).includes(true) ?? false)
       setCanAddChannel(result.members.find(x => x?.id === props.user)?.roles.map(role => ((result.roles.find(x => x?.id === role)?.permissions ?? 0) & 0x0000000008) === 0x0000000008).includes(true) ?? false)  
       setCanChangeNickname(result.members.find(x => x?.id === props.user)?.roles.map(role => ((result.roles.find(x => x?.id === role)?.permissions ?? 0) & 0x0000000200) === 0x0000000200).includes(true) ?? false)
         setCanManage(result.members.find(x => x?.id === props.user)?.roles.map(role => (((result.roles.find(x => x?.id === role)?.permissions ?? 0) & 0x0000000004) === 0x0000000004) || (((result.roles.find(x => x?.id === role)?.permissions ?? 0) & 0x0000000010) === 0x0000000010) || (((result.roles.find(x => x?.id === role)?.permissions ?? 0) & 0x0000000020) === 0x0000000020) || (((result.roles.find(x => x?.id === role)?.permissions ?? 0) & 0x0000000800) === 0x0000000800)).includes(true) ?? false)
      }
      )
    }, []);

    useEffect(() => {
      props.setModalOpened(createChannel || editNickname);
    }, [createChannel, editNickname]);

    useOutsideAlerter(infoRef);

    useOutsideAlerter2(createChannelRef);

    useOutsideAlerter3(editNicknameRef);

    function useOutsideAlerter(ref: React.RefObject<HTMLDivElement>) {
      useEffect(() => {
          function handleClickOutside(event: Event) {
              if (ref.current && !ref.current.contains(event.target as Node)) {
                 setNotOnWait(false);
                  setShowInfo(false);
              }
          }
  
          document.addEventListener("mousedown", handleClickOutside);
          return () => {
              document.removeEventListener("mousedown", handleClickOutside);
          };
      }, [ref]);
  }

  function useOutsideAlerter2(ref: React.RefObject<HTMLDivElement>) {
   useEffect(() => {
       function handleClickOutside(event: Event) {
           if (ref.current && !ref.current.contains(event.target as Node)) {
              setCreateChannel(false);
           }
       }

       document.addEventListener("mousedown", handleClickOutside);
       return () => {
           document.removeEventListener("mousedown", handleClickOutside);
       };
   }, [ref]);
}

function useOutsideAlerter3(ref: React.RefObject<HTMLDivElement>) {
   useEffect(() => {
       function handleClickOutside(event: Event) {
           if (ref.current && !ref.current.contains(event.target as Node)) {
              setEditNickname(false);
           }
       }

       document.addEventListener("mousedown", handleClickOutside);
       return () => {
           document.removeEventListener("mousedown", handleClickOutside);
       };
   }, [ref]);
}

   return (<>
   {createChannel ? <div ref={createChannelRef}><CreateChannel domain={props.domain} guild={props.guild} setCreateChannel={setCreateChannel}></CreateChannel></div> : null}
   {editNickname ? <div ref={editNicknameRef}><EditNickname domain={props.domain} guild={props.guild} setEditNickname={setEditNickname}></EditNickname></div> : null}
   <div className="guildInfoContainer">
   <button className="unbuttoned guildInfo" onClick={() => {
         if(!showInfo && notOnWait) {
          setShowInfo(true); 
         } else if(!notOnWait) {
            setNotOnWait(true);
         }
      }} onKeyDown={(event) => {
         if(event.key === 'Escape') {
            setShowInfo(false);
         }
      }}>
         <h4>{guildName}</h4>
         <span className="fluentIcon guildInfoArrow">&#xf262;</span>
      </button>
      {showInfo ? (<div ref={infoRef} className="guildMenu">
      {canInvite ? <button className="guildMenuButton">
      <h3 className="fluentIconBorder guildMenuButtonIcon">&#xf5ad;</h3>
         <h3 className="guildMenuButtonText">Invite people</h3>
         </button> : null}
         {canAddChannel ? <button className="guildMenuButton" onClick={() => {
            setShowInfo(false);
            setCreateChannel(true);
         }}>
      <h3 className="fluentIcon guildMenuButtonIcon">&#xf10b;</h3>
         <h3 className="guildMenuButtonText">Create channel</h3>
         </button> : null}
      {canManage ? <button className="guildMenuButton">
      <h3 className="fluentIconBorder guildMenuButtonIcon">&#xf6ab;</h3>
         <h3 className="guildMenuButtonText">Settings</h3>
         </button> : null}
      {canChangeNickname ? <button className="guildMenuButton" onClick={() => {
            setShowInfo(false);
            setEditNickname(true);
         }}>
      <h3 className="fluentIconBorder guildMenuButtonIcon">&#xf3de;</h3>
         <h3 className="guildMenuButtonText">Edit nickname</h3>
         </button> : null}
      {!isOwner ? (<button className="guildMenuButton">
      <h3 className="fluentIconBorder guildMenuButtonIcon">&#xfffc;</h3>
         <h3 className="guildMenuButtonText" onClick={() => {
         fetch(props.domain + '/users/@me/guilds/' + props.guild, {
            method: 'DELETE',
            headers: new Headers({
                'Authorization': localStorage.getItem('token') ?? '  '
            })
         });
      }}>Leave</h3>
      </button>) : null}
      </div>) : null}
      </div>
      </>);
}

export default GuildInfo;