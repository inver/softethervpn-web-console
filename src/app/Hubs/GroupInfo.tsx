import React from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button
} from '@patternfly/react-core';
import {
  TableComposable,
  Thead,
  Tbody,
  Tr,
  Th,
  Td
} from '@patternfly/react-table';


class GroupInfo extends React.Component {
  constructor(props: Readonly<RouteComponentProps<{ tag: string }>>){
    super(props);

    this.state = {
      groupObject: this.props.group
    }

    this.onRefreshClick = this.onRefreshClick.bind(this);
  }

  UNSAFE_componentWillReceiveProps(nextProps: Readonly<RouteComponentProps<{ tag: string }>>): void {
    this.setState({ groupObject: nextProps.group })
  }

  onRefreshClick(): void {
    this.props.onRefresh()
  }

  render(): React.Component {
    const { groupObject } = this.state;

    return(
      <React.Fragment>
      <Card id="groupStats">
      <CardHeader>
        <Button variant="secondary" onClick={this.onRefreshClick}>Refresh</Button>
      </CardHeader>
      <CardBody>
        <TableComposable variant='compact'>
          <Thead>
          <Tr>
            <Th/>
            <Th/>
          </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>Outgoing Unicast Packets</Td>
              <Td>{groupObject['Send.UnicastCount_u64']} packets</Td>
            </Tr>
            <Tr>
              <Td>Outgoing Unicast Total Size</Td>
              <Td>{groupObject['Send.UnicastBytes_u64']} bytes</Td>
            </Tr>
            <Tr>
              <Td>Outgoing Broadcast Packets</Td>
              <Td>{groupObject['Send.BroadcastCount_u64']} packets</Td>
            </Tr>
            <Tr>
              <Td>Outgoing Broadcast Total Size</Td>
              <Td>{groupObject['Send.BroadcastBytes_u64']} bytes</Td>
            </Tr>
            <Tr>
              <Td>Incoming Unicast Packets</Td>
              <Td>{groupObject['Recv.UnicastCount_u64']} packets</Td>
            </Tr>
            <Tr>
              <Td>Incoming Unicast Total Size</Td>
              <Td>{groupObject['Recv.UnicastBytes_u64']} bytes</Td>
            </Tr>
            <Tr>
              <Td>Incoming Broadcast Packets</Td>
              <Td>{groupObject['Recv.BroadcastCount_u64']} packets</Td>
            </Tr>
            <Tr>
              <Td>Incoming Broadcast Total Size</Td>
              <Td>{groupObject['Recv.BroadcastBytes_u64']} bytes</Td>
            </Tr>
          </Tbody>
        </TableComposable>
      </CardBody>
      </Card>
      </React.Fragment>
    )
  }
}

export { GroupInfo };
