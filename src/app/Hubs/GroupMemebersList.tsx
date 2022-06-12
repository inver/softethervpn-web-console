import React from 'react';
import {
  Card,
  CardBody,
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Title
} from '@patternfly/react-core';
import {
  TableComposable,
  Thead,
  Tbody,
  Tr,
  Th,
  Td
} from '@patternfly/react-table';
import { api } from '@app/utils/vpnrpc_settings';
import * as VPN from "vpnrpc/dist/vpnrpc";

const emptyTable = (
            <Tr>
              <Td colSpan={12}>
                <Bullseye>
                  <EmptyState variant={EmptyStateVariant.small}>
                    <Title headingLevel="h2" size="lg">
                      No users found
                    </Title>
                    <EmptyStateBody>
                      There is not yet any user in this group. Add users to this group first.
                    </EmptyStateBody>
                  </EmptyState>
                </Bullseye>
                </Td>
            </Tr>
);

class GroupMemberList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hubName: this.props.hubname,
      usersList: [],
      groupName: this.props.groupName,
      isEmpty: true
    }
  }

  loadUsers(){
    const param: VPN.VpnRpcEnumUserItem = new VPN.VpnRpcEnumUserItem({
      HubName_str: this.state.hubName
    });

    api.EnumUser(param)
    .then( (result) => {
      this.setState({
        usersList: result.UserList,
        isEmpty: result.UserList.length === 0
      });
    })
    .catch( (error) => {
      alert(error);
    });
  }

  componentDidMount(): void {
    this.loadUsers();
  }

  render(){
    const {
      usersList,
      groupName,
      isEmpty
    } = this.state;

    return (
      <React.Fragment>
      <Card id="membersList">
      <CardBody>
      <TableComposable variant='compact'>
        <Thead>
          <Tr>
            <Th>User Name</Th>
            <Th>Full Name</Th>
            <Th>Description</Th>
            <Th>Last Login</Th>
          </Tr>
        </Thead>
        <Tbody>
            {
              isEmpty ? emptyTable :
              usersList.map( (user) => {
                const lastLogin = new Date(user.LastLoginTime_dt)
                if(groupName === user.GroupName_str){
                  return(
                    <Tr key={user.Name_str}>
                      <Th>{user.Name_str}</Th>
                      <Th>{user.Realname_utf}</Th>
                      <Th>{user.Note_utf}</Th>
                      <Th>{lastLogin.getTime() == 32400000 ? "None" : new Date(user.LastLoginTime_dt).toLocaleString()}</Th>
                    </Tr>
                  );
                }
                return;
              })
            }
        </Tbody>
      </TableComposable>
      </CardBody>
      </Card>
      </React.Fragment>
    );
  }
}

export { GroupMemberList };
