import React from 'react';
import {
  Bullseye,
  Spinner,
  Stack,
  StackItem,
  Flex,
  FlexItem,
  Button,
  Form,
  FormGroup,
  ActionGroup,
  PageSection,
  PageSectionVariants,
  Text,
  Title,
  TextContent,
  Divider,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  DataList,
  DataListItem,
  DataListCell,
  DataListItemRow,
  DataListItemCells,
  Modal,
  ModalVariant,
  NumberInput,
  Alert
} from '@patternfly/react-core';
import { api } from '@app/utils/vpnrpc_settings';
import * as VPN from "vpnrpc/dist/vpnrpc";

function isContained(array: Array, el) {
  let result = false;
  array.forEach(element => {
    if(element == el){
      result = true;
    }
  })
  return result;
}

const Listeners: React.FunctionComponent = () => (
  <React.Fragment>
  <PageSection variant={PageSectionVariants.light}>
  <TextContent>
    <Title headingLevel="h1" size="lg">Listeners</Title>
    <Text component="p">
      Below you can find the list of currently defined TCP listeners.<br />
      You can create, delete, start and stop listeners.
    </Text>
  </TextContent>
  </PageSection>
  <Divider component="div" />
  <PageSection>
    <ListenersCard />
  </PageSection>
  </React.Fragment>
)

class ListenersCard extends React.Component {
  constructor(props){
    super(props);

    this.minValue = 1;
    this.maxValue = 65535;

    this.state = {
      loading: true,
      selectedDataListItemId: "",
      rowsList: [
        <DataListItem aria-labelledby="selectable-action-loading" id="loading" key="loading key">
                <Bullseye>
                    <Spinner size="xl" />
                </Bullseye>
        </DataListItem>
      ],
      listenerState: {},
      isModalOpen: false,
      newport: 1,
      portList: [],
    };

    this.onMinus = () => {
      this.setState({
        newport: this.state.newport - 1
      });
    };

    this.onChange = event => {
      const newValue = isNaN(event.target.value) ? 0 : Number(event.target.value);
      this.setState({
        newport: newValue > this.maxValue ? this.maxValue : newValue < this.minValue ? this.minValue : newValue
      });
    };

    this.onPlus = () => {
      this.setState({
        newport: this.state.newport + 1
      });
    };

    this.onSelectDataListItem = id => {
      this.setState({ selectedDataListItemId: id });
    };

    this.handleCreateClick = () =>
    {
      const param: VPN.VpnRpcListener = new VPN.VpnRpcListener({
        Port_u32: this.state.newport,
        Enable_bool: true,
      });

      api.CreateListener(param)
      .then( () => {
        this.setState({ loading: true, isModalOpen: false });
      })
      .catch( error => {
        console.log(error)
      });
    };

    this.handleDeleteClick = () =>
    {
      const param: VPN.VpnRpcListener = new VPN.VpnRpcListener({
        Port_u32: Number(this.state.selectedDataListItemId)
      });

      api.DeleteListener(param)
      .then( () => {
        this.setState({ loading: true });
      })
      .catch( error => {
        console.log(error)
      });
    };

    this.handleStartClick = () =>
    {
      const param: VPN.VpnRpcListener = new VPN.VpnRpcListener({
        Port_u32: Number(this.state.selectedDataListItemId),
        Enable_bool: true,
      });

      api.EnableListener(param)
      .then( () => {
        this.setState({ loading: true });
      })
      .catch( error => {
        console.log(error)
      });
    };

    this.handleStopClick = () =>
    {
      const param: VPN.VpnRpcListener = new VPN.VpnRpcListener({
        Port_u32: Number(this.state.selectedDataListItemId),
        Enable_bool: false,
      });

      api.EnableListener(param)
      .then( () => {
        this.setState({ loading: true });
      })
      .catch( error => {
        console.log(error)
      });
    };

    this.handleModalToggle = () => {
      this.setState(({ isModalOpen }) => ({
        isModalOpen: !isModalOpen
      }));
    };
  }

  renderList()
  {
    api.EnumListener()
    .then( response => {
      const rows = [];
      const listeners = {};
      let lastport = 1;
      const portList = [];

      response.ListenerList.forEach( listener => {
        if(listener.Ports_u32 > lastport && listener.Ports_u32 < this.maxValue){
          lastport = listener.Ports_u32 + 1;
        }

        portList.push(listener.Ports_u32)

        let status = "Listening";

        if(listener.Errors_bool){
          status = "Error"
        }

        if(!listener.Enables_bool){
          status = "Stopped";
        }

        const row =
          <DataListItem aria-labelledby={"selectable-action-"+listener.Ports_u32.toString()} id={listener.Ports_u32.toString()} key={listener.Ports_u32.toString() + " key"}>
                <DataListItemRow>
                  <DataListItemCells
                    dataListCells={[
                      <DataListCell key="primary content">
                        TCP {listener.Ports_u32}
                      </DataListCell>,
                      <DataListCell key="secondary content">{status}</DataListCell>
                    ]}
                  />
                </DataListItemRow>
              </DataListItem>
        ;
        rows.push(row);
        listeners[listener.Ports_u32.toString()] = listener.Enables_bool;
      });

      this.setState({ loading: false, rowsList: rows, listenerState: listeners, newport: lastport, portList: portList  });
    })
    .catch( error => {
      console.log(error)
    });
  }

  componentDidMount(){
    this.renderList()
  }

  componentDidUpdate(){
    if(this.state.loading){
      this.renderList()
    }
  }


  render(){
    const { selectedDataListItemId, rowsList, listenerState, isModalOpen, newport, portList } = this.state;

    return(
      <React.Fragment>
      <Card isFullHeight>
        <CardTitle>Management of Listeners</CardTitle>
        <CardBody>
        <DataList
          aria-label="listeners list"
          selectedDataListItemId={selectedDataListItemId}
          onSelectDataListItem={this.onSelectDataListItem}
        >
        {rowsList}
        </DataList>
        </CardBody>
        <CardFooter>
        <Form>
        <ActionGroup>
          <Button variant="primary" onClick={this.handleModalToggle}>Create</Button>
          <Button variant="primary" isDisabled={selectedDataListItemId == ""} onClick={this.handleDeleteClick}>Delete</Button>
          <Button variant="primary" isDisabled={selectedDataListItemId == "" || listenerState[selectedDataListItemId]} onClick={this.handleStartClick}>Start</Button>
          <Button variant="primary" isDisabled={selectedDataListItemId == "" || !listenerState[selectedDataListItemId]} onClick={this.handleStopClick}>Stop</Button>
        </ActionGroup>
        </Form>
        </CardFooter>
      </Card>
      <Modal
          variant={ModalVariant.small}
          title="Create Listener"
          isOpen={isModalOpen}
          onClose={this.handleModalToggle}
          actions={[
            <Button key="confirm" variant="primary" onClick={this.handleCreateClick} isDisabled={isContained(portList, newport)}>
              Confirm
            </Button>,
            <Button key="cancel" variant="link" onClick={this.handleModalToggle}>
              Cancel
            </Button>
          ]}
        >
          <Stack hasGutter>
          <StackItem>
            You can add a TCP/IP port number for the VPN Server to accept connections from clients.<br/><br/>
            Specify the port number to add.
          </StackItem>
          <StackItem>
          <Form isHorizontal>
          <FormGroup label="Port Number">
          <Flex>
            <FlexItem>
            <NumberInput
              value={newport}
              min={this.minValue}
              max={this.maxValue}
              onMinus={this.onMinus}
              onChange={this.onChange}
              onPlus={this.onPlus}
              inputName="port"
              inputAriaLabel="port input"
              minusBtnAriaLabel="minus"
              plusBtnAriaLabel="plus"
            />
            </FlexItem>
            <FlexItem>
              (TCP/IP Port)
            </FlexItem>
            </Flex>
          </FormGroup>
          </Form>
          </StackItem>
          <StackItem>
            <Alert variant="info" isInline title="Only one program can bind a TCP/IP port">
              If the port number is already being used by another server program, the status of the new listener will be error.<br/><br/>
              In this case, stop the other program that is opening the same port.
            </Alert>
          </StackItem>
          </Stack>
        </Modal>
      </React.Fragment>
    );
  }
}

export { Listeners };
