import React from 'react';
import { UsersList } from '@app/Hubs/Users';
import { GroupsList } from '@app/Hubs/Groups';
import { Properties } from '@app/Hubs/Properties';
import { SettingsRADIUS } from '@app/Hubs/SettingsRADIUS';

class ManagementSubsection extends React.Component {
    constructor(props){
        super(props);
    
        this.state = {
          hub: this.props.hub,
          subsection: this.props.subsection
        };
    }

    render() {
        const { hub, subsection } = this.state;

        return(
            <React.Fragment>
            {   subsection === "users" ?
                <UsersList hub={hub}/>
                :
                subsection === "groups" ?
                <GroupsList hub={hub}/>
                :
                subsection === "accesslists" ?
                <>test</>
                :
                subsection === "properties" ?
                <Properties hub={hub}/>
                :
                subsection === "radius" ?
                <SettingsRADIUS hub={hub}/>
                :
                subsection === "cascadeconnections" ?
                <>test</>
                :
                subsection === "extendedoptions" ?
                <>test</>
                :
                subsection === "adminoptions" ?
                <>test</>
                :
                subsection === "ipaccesscontrol" ?
                <>test</>
                :
                subsection === "connectionmessage" ?
                <>test</>
                :
                subsection === "sessions" ?
                <>test</>
                :
                subsection === "logs" ?
                <>test</>
                :
                subsection === "certificates" ?
                <>test</>
                :
                subsection === "securenat" ?
                <>test</>
                :
                <>error</>
            }
            </React.Fragment>
        );
    }
}

export { ManagementSubsection };