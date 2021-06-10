import React from 'react';
import {
  Modal,
  ModalVariant,
  Button,
  Stack,
  StackItem,
  Card,
  CardTitle,
  CardBody,
  DataList,
  DataListItem,
  DataListItemRow,
  DataListItemCells,
  DataListCell,
} from '@patternfly/react-core';
import * as x509 from "../../../node_modules/@peculiar/x509";
import { crt_field2object } from '@app/utils/string_utils';
import { downloadBlob } from '@app/utils/blob_utils';

function prettyHex(rawString: string): string
{
  let string = ""
  for (let i=0; i<rawString.length; i++){
    string = string.concat(rawString[i]);
    if((i+1)%2 == 0){
      string = string.concat(" ");
    }
  }
  string = string.toUpperCase();
  return string;
}

// pass a "certBin={certificate_base64: string}" and a "buttonText={string: string}" props and optionally "isDisabled={bool: boolean}"
class ViewCertModal extends React.Component {
  constructor(props: Readonly<RouteComponentProps<{ tag: string }>>) {
    super(props);
    this.state = {
      isModalOpen: false,
      cert: null,
      issuedToObject: {},
      issuedByObject: {},
      pubKey: "",
      signature: "",
    };
    this.handleModalToggle = () => {
      this.setState(({ isModalOpen }) => ({
        isModalOpen: !isModalOpen
      }));
    };

    this.onDownloadClick = () => {
      downloadBlob(new Blob([this.state.cert.toString()], { type: "text/plain"}), this.state.issuedToObject["CN"] + ".pem");
    };
  }

  componentDidUpdate(): void {
    if(this.props.certBin != null && this.state.cert == null ){
      const cert = new x509.X509Certificate(this.props.certBin);

      const signatureView = new Uint32Array(cert.signature);
      let signatureStr = ""
      for (let i = 0; i<signatureView.length; i++){
        signatureStr = signatureStr.concat(signatureView[i]);
      }


      this.setState({
        cert: cert,
        issuedToObject: crt_field2object(cert.subject),
        issuedByObject: crt_field2object(cert.issuer),
        pubKey: prettyHex(cert.publicKey.toString("hex")),
        signature: prettyHex(signatureStr),
      });
      // console.log(cert)
      // console.log(crt_field2object(cert.subject))
    }
  }

  render(): React.Component {
    const { isModalOpen, cert, issuedToObject, issuedByObject, pubKey, signature } = this.state;


    return (
      <React.Fragment>
        <Button variant="primary" onClick={this.handleModalToggle} isDisabled={this.props.isDisabled}>
          {this.props.buttonText}
        </Button>
        <Modal
          variant={ModalVariant.large}
          title={"Certificate for " + issuedToObject["CN"]}
          isOpen={isModalOpen}
          onClose={this.handleModalToggle}
          actions={[
            <Button key="download" variant="primary" onClick={this.onDownloadClick}>
              Download Certificate
            </Button>,
            <Button key="cancel" variant="link" onClick={this.handleModalToggle}>
              Close
            </Button>
          ]}
        >
        { cert == null ? "Loading..." :
        <Stack>
        <StackItem>
          <Card isCompact>
            <CardTitle>Issued To</CardTitle>
            <CardBody>
              <DataList aria-label="Issued To Data List" isCompact>
                <DataListItem aria-labelledby="CNB">
                  <DataListItemRow>
                    <DataListItemCells
                      dataListCells={[
                        <DataListCell key="primary content">
                          <span id="CNB"><b>Common Name</b></span>
                        </DataListCell>,
                        <DataListCell key="secondary content">{issuedByObject["CN"]}</DataListCell>
                      ]}
                    />
                  </DataListItemRow>
                </DataListItem>
                <DataListItem aria-labelledby="OB">
                  <DataListItemRow>
                    <DataListItemCells
                      dataListCells={[
                        <DataListCell key="primary content">
                          <span id="OB"><b>Organization</b></span>
                        </DataListCell>,
                        <DataListCell key="secondary content">{issuedByObject["O"]}</DataListCell>
                      ]}
                    />
                  </DataListItemRow>
                </DataListItem>
                <DataListItem aria-labelledby="OUB">
                  <DataListItemRow>
                    <DataListItemCells
                      dataListCells={[
                        <DataListCell key="primary content">
                          <span id="OUB"><b>Organizational Unit</b></span>
                        </DataListCell>,
                        <DataListCell key="secondary content">{issuedByObject["OU"]}</DataListCell>
                      ]}
                    />
                  </DataListItemRow>
                </DataListItem>
              </DataList>
            </CardBody>
          </Card>
        </StackItem>
        <StackItem>
        <Card isCompact>
          <CardTitle>Issued By</CardTitle>
          <CardBody>
            <DataList aria-label="Issued By Data List" isCompact>
              <DataListItem aria-labelledby="CN">
                <DataListItemRow>
                  <DataListItemCells
                    dataListCells={[
                      <DataListCell key="primary content">
                        <span id="CN"><b>Common Name</b></span>
                      </DataListCell>,
                      <DataListCell key="secondary content">{issuedToObject["CN"]}</DataListCell>
                    ]}
                  />
                </DataListItemRow>
              </DataListItem>
              <DataListItem aria-labelledby="O">
                <DataListItemRow>
                  <DataListItemCells
                    dataListCells={[
                      <DataListCell key="primary content">
                        <span id="O"><b>Organization</b></span>
                      </DataListCell>,
                      <DataListCell key="secondary content">{issuedToObject["O"]}</DataListCell>
                    ]}
                  />
                </DataListItemRow>
              </DataListItem>
              <DataListItem aria-labelledby="OU">
                <DataListItemRow>
                  <DataListItemCells
                    dataListCells={[
                      <DataListCell key="primary content">
                        <span id="OU"><b>Organizational Unit</b></span>
                      </DataListCell>,
                      <DataListCell key="secondary content">{issuedToObject["OU"]}</DataListCell>
                    ]}
                  />
                </DataListItemRow>
              </DataListItem>
              <DataListItem aria-labelledby="C">
                <DataListItemRow>
                  <DataListItemCells
                    dataListCells={[
                      <DataListCell key="primary content">
                        <span id="C"><b>Country</b></span>
                      </DataListCell>,
                      <DataListCell key="secondary content">{issuedToObject["C"]}</DataListCell>
                    ]}
                  />
                </DataListItemRow>
              </DataListItem>
              <DataListItem aria-labelledby="SN">
                <DataListItemRow>
                  <DataListItemCells
                    dataListCells={[
                      <DataListCell key="primary content">
                        <span id="SN"><b>Serial Number</b></span>
                      </DataListCell>,
                      <DataListCell key="secondary content">{cert.serialNumber}</DataListCell>
                    ]}
                  />
                </DataListItemRow>
              </DataListItem>
            </DataList>
          </CardBody>
        </Card>
        </StackItem>
        <StackItem>
        <Card isCompact>
          <CardTitle>Validity</CardTitle>
          <CardBody>
            <DataList aria-label="Validity Data List" isCompact>
              <DataListItem aria-labelledby="NotBefore">
                <DataListItemRow>
                  <DataListItemCells
                    dataListCells={[
                      <DataListCell key="primary content">
                        <span id="NotBefore"><b>Issued On</b></span>
                      </DataListCell>,
                      <DataListCell key="secondary content">{cert.notBefore.toLocaleString()}</DataListCell>
                    ]}
                  />
                </DataListItemRow>
              </DataListItem>
              <DataListItem aria-labelledby="NotAfter">
                <DataListItemRow>
                  <DataListItemCells
                    dataListCells={[
                      <DataListCell key="primary content">
                        <span id="NotAfter"><b>Expires On</b></span>
                      </DataListCell>,
                      <DataListCell key="secondary content">{cert.notAfter.toLocaleString()}</DataListCell>
                    ]}
                  />
                </DataListItemRow>
              </DataListItem>
            </DataList>
          </CardBody>
        </Card>
        </StackItem>
        <StackItem>
        <Card isCompact>
          <CardTitle>Validity</CardTitle>
          <CardBody>
            <DataList aria-label="Fingerprint Data List" isCompact>
              <DataListItem aria-labelledby="PUBKEY">
                <DataListItemRow>
                  <DataListItemCells
                    dataListCells={[
                      <DataListCell key="primary content">
                        <span id="PUBKEY"><b>Public Key</b></span>
                      </DataListCell>,
                      <DataListCell key="secondary content">{pubKey}</DataListCell>
                    ]}
                  />
                </DataListItemRow>
              </DataListItem>
              <DataListItem aria-labelledby="SHA">
                <DataListItemRow>
                  <DataListItemCells
                    dataListCells={[
                      <DataListCell key="primary content">
                        <span id="SHA"><b>{cert.signatureAlgorithm.hash.name} Signature</b></span>
                      </DataListCell>,
                      <DataListCell key="secondary content">{signature}</DataListCell>
                    ]}
                  />
                </DataListItemRow>
              </DataListItem>
            </DataList>
          </CardBody>
        </Card>
        </StackItem>
        </Stack>}

        </Modal>

      </React.Fragment>
    );
  }
}

export { ViewCertModal };
