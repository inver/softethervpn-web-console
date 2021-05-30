import * as React from 'react';
import {
  PageSection,
  PageSectionVariants,
  Stack,
  StackItem,
  Text,
  TextContent,
  Title,
  Divider,
  Card,
  CardBody,
  Switch,
  Button,
  Gallery,
  GalleryItem,
} from '@patternfly/react-core';
import { api } from '@app/utils/vpnrpc_settings';
import * as VPN from "vpnrpc/dist/vpnrpc";
import ExternalLinkSquareAltIcon from '@patternfly/react-icons/dist/js/icons/external-link-square-alt-icon';

const VpnAzure: React.FunctionComponent = () => (
  <React.Fragment>
  <PageSection variant={PageSectionVariants.light}>
  <TextContent>
    <Title headingLevel="h1" size="lg">VPN Azure Cloud VPN Service (Free)</Title>
    <Text component="p">
        VPN Azure makes it easier to establish a VPN Sessioin from your home PC to your office PC. While a VPN connection is established, you can access any other server on the private network of your company.
        <br/>
        <br/>
        You don{"'"}t need a global IP address on the office PC (VPN Server). It can work behind firewalls or NATs. No network administrator{"'"}s configuration required. You can use thge built-in SSTP-VPN Client of Windows in your home PC.
        <br/><br/>
        VPN Azure is a cloud VPN service operated by SoftEther VPN Project. VPN Azure is free of charge and available to anyone. You can find additional details in the <Button variant="link" isInline icon={<ExternalLinkSquareAltIcon />} iconPosition="right" onClick={() => window.open("https://www.vpnazure.net/en/")} >How to use VPN Azure</Button> instructions.
    </Text>
  </TextContent>
  </PageSection>
  <Divider component="div" />
  <PageSection>
  <Gallery>
  <GalleryItem>
    <AzureComponent />
  </GalleryItem>
  </Gallery>
  </PageSection>
  </React.Fragment>
);



class AzureComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isChecked: false,
      isConnected: false,
      hostName: "",
    };
    this.handleChange = isChecked => {
      const param: VPN.VpnRpcAzureStatus = new VPN.VpnRpcAzureStatus({
        IsEnabled_bool: isChecked
      });

      api.SetAzureStatus(param)
      .then( response => {
        if(isChecked && !response.IsConnected_bool){
          setTimeout(() => {
            this.loadStatus()
          }, 1000);
        }

        this.setState({ isConnected: response.IsConnected_bool})
      })
      .catch( error => {
        console.log(error)
      });

      this.setState({ isChecked });
    };
  }

  loadHostname(){
    api.GetDDnsClientStatus()
    .then( response => {
      this.setState({ hostName: response.CurrentHostName_str });
    })
    .catch(error => {
      console.log(error)
    });
  }

  loadStatus(){
    api.GetAzureStatus()
    .then( response => {

      if(response.IsEnabled_bool){
        this.loadHostname()
      }

      this.setState({ isChecked: response.IsEnabled_bool, isConnected: response.IsConnected_bool });
    })
    .catch(error => {
      console.log(error)
    });
  }

  componentDidMount(){
    this.loadStatus()
  }

  render() {
    const { isChecked, isConnected, hostName } = this.state;
    return (
      <React.Fragment>
      <Card>
      <CardBody>
      <Stack hasGutter>
      <StackItem>
      <Switch
        id="azure-switch"
        label="VPN Azure enabled"
        labelOff="VPN Azure disabled"
        isChecked={isChecked}
        onChange={this.handleChange}
      />
      </StackItem>
      <StackItem>
        <b>Status:</b> {isConnected ? "Connected" : "Not Connected"}
      </StackItem>
      { isChecked ?
        <React.Fragment>
        <StackItem>
        <Text>
          The VPN Azure hostname is the same as the Dynamic DNS hostname with the alteration of the domain suffix to &ldquo;vpnazure.net&rdquo;
        </Text>
        </StackItem>
        <StackItem>
        <Text>
          <b>{hostName == "" ? "" : hostName + ".vpnazure.net"}</b>
        </Text>
        </StackItem>
        <StackItem>
        <Button onClick={() => window.location = "/#/functionalities/ddns"}>Change Hostname</Button>
        </StackItem>
        </React.Fragment>
        :
        ""
      }
      </Stack>
      </CardBody>
      </Card>
      </React.Fragment>
    );
  }
}


export { VpnAzure };
