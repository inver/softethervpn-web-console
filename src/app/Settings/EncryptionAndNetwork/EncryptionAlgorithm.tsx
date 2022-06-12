import React from 'react';
import {
  Text,
  Card,
  CardHeader,
  CardBody,
  Bullseye,
  Spinner,
  Stack,
  StackItem,
  Form,
  FormGroup,
  Select,
  SelectDirection,
  SelectVariant,
  SelectOption
} from '@patternfly/react-core';
import { api } from '@app/utils/vpnrpc_settings';
import * as VPN from "vpnrpc/dist/vpnrpc";

class ServerEncryptionCard extends React.Component {
  constructor(props){
    super(props);

    this.options = [
      <SelectOption key={0} value="RC4-MD5" />,
      <SelectOption key={1} value="RC4-SHA" />,
      <SelectOption key={2} value="AES128-SHA" />,
      <SelectOption key={3} value="AES256-SHA" />,
      <SelectOption key={4} value="DES-CBC-SHA" />,
      <SelectOption key={5} value="DES-CBC3-SHA" />,
      <SelectOption key={6} value="DHE-RSA-AES128-SHA" />,
      <SelectOption key={7} value="DHE-RSA-AES256-SHA" />,
      <SelectOption key={8} value="AES128-GCM-SHA256" />,
      <SelectOption key={9} value="AES128-SHA256" />,
      <SelectOption key={10} value="AES256-GCM-SHA384" />,
      <SelectOption key={11} value="AES256-SHA256" />,
      <SelectOption key={12} value="DHE-RSA-AES128-GCM-SHA256" />,
      <SelectOption key={13} value="DHE-RSA-AES128-SHA256" />,
      <SelectOption key={14} value="DHE-RSA-AES256-GCM-SHA384" />,
      <SelectOption key={15} value="DHE-RSA-AES256-SHA256" />,
      <SelectOption key={16} value="ECDHE-RSA-AES128-GCM-SHA256" />,
      <SelectOption key={17} value="ECDHE-RSA-AES128-SHA256" />,
      <SelectOption key={18} value="ECDHE-RSA-AES256-GCM-SHA384" />,
      <SelectOption key={19} value="ECDHE-RSA-AES256-SHA384" />,
      <SelectOption key={20} value="DHE-RSA-CHACHA20-POLY1305" />,
      <SelectOption key={21} value="ECDHE-RSA-CHACHA20-POLY1305" />,
    ];

    this.state = {
      loading: true,
      options: [],
      isToggleIcon: false,
      isOpen: false,
      selected: null,
      isDisabled: false,
      direction: SelectDirection.down
    };

    this.clearSelection = () => {
      this.setState({
        selected: null,
        isOpen: false
      });
    };

    this.onToggle = isOpen => {
      this.setState({
        isOpen
      });
    };

    this.onSelect = (event, selection, isPlaceholder) => {
      if (isPlaceholder) this.clearSelection();
      else {
        const param: VPN.VpnRpcStr = new VPN.VpnRpcStr({
          String_str: selection,
        });

        api.SetServerCipher(param)
        .catch( error => {
          console.log(error)
        });

        this.setState({
          selected: selection,
          isOpen: false
        });
      }
    };
  }

  componentDidMount() {
    api.GetServerCipher()
    .then( response => {
      this.setState({ loading: false, selected: response.String_str });
    })
    .catch( error => {
      console.log(error)
    });

  }

  render() {
    const { loading, isOpen, selected, isDisabled, direction } = this.state;


    return(
      <React.Fragment>
      <Card isRounded isCompact>
      <CardHeader><b>Encription Algorithm Settings</b></CardHeader>
       <CardBody>
       <Stack hasGutter>
        <StackItem>
          <Text>Specify the encryption algorithm for SSL applied to the <br/> connection between this VPN Server and VPN Clients.<br/>The encryption algorithm must be compatible with SSL Version 3.
          </Text>
        </StackItem>
        <StackItem>
          <Form isHorizontal>
          <FormGroup label="Encryption Algorithm Name" fieldId="EncryptionAlgorithm">
          <Select
            id="EncryptionAlgorithm"
            variant={SelectVariant.single}
            aria-label="Select Encryption Algorithm"
            onToggle={this.onToggle}
            onSelect={this.onSelect}
            selections={ loading ? "Loading..." : selected }
            isOpen={isOpen}
            aria-labelledby="EncryptionAlgorithm"
            isDisabled={isDisabled}
            direction={direction}
            maxHeight={320}
          >
            {loading ? <SelectOption key={0} ><Bullseye><Spinner size="sm" /></Bullseye></SelectOption> : this.options}
          </Select>
          </FormGroup>
          </Form>
        </StackItem>
       </Stack>
       </CardBody>
      </Card>
      </React.Fragment>
    );
  }
}

export { ServerEncryptionCard };
