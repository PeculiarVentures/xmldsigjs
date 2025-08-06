import { XE, XmlError, Convert, XmlChildElement, XmlElement } from 'xml-core';

import { X509Certificate } from '../../pki';
import { XmlSignature } from '../xml_names';
import { XmlSignatureObject } from '../xml_object';
import { KeyInfoClause } from './key_info_clause';

/**
 * Represents the <X509Data> element of an XML signature.
 *
 * ```xml
 * <element name="X509Data" type="ds:X509DataType"/>
 * <complexType name="X509DataType">
 *   <sequence maxOccurs="unbounded">
 *     <choice>
 *       <element name="X509IssuerSerial" type="ds:X509IssuerSerialType"/>
 *       <element name="X509SKI" type="base64Binary"/>
 *       <element name="X509SubjectName" type="string"/>
 *       <element name="X509Certificate" type="base64Binary"/>
 *       <element name="X509CRL" type="base64Binary"/>
 *       <any namespace="##other" processContents="lax"/>
 *     </choice>
 *   </sequence>
 * </complexType>
 *
 *  <complexType name="X509IssuerSerialType">
 *    <sequence>
 *      <element name="X509IssuerName" type="string"/>
 *      <element name="X509SerialNumber" type="integer"/>
 *    </sequence>
 *  </complexType>
 * ```
 */

@XmlElement({ localName: XmlSignature.ElementNames.X509IssuerSerial })
export class X509IssuerSerial extends XmlSignatureObject {
  @XmlChildElement({
    localName: XmlSignature.ElementNames.X509IssuerName,
    namespaceURI: XmlSignature.NamespaceURI,
    prefix: XmlSignature.DefaultPrefix,
    required: true,
  })
  public X509IssuerName: string;

  @XmlChildElement({
    localName: XmlSignature.ElementNames.X509SerialNumber,
    namespaceURI: XmlSignature.NamespaceURI,
    prefix: XmlSignature.DefaultPrefix,
    required: true,
  })
  public X509SerialNumber: string;
}

export enum X509IncludeOption {
  None,
  EndCertOnly,
  ExcludeRoot,
  WholeChain,
}

export interface IX509IssuerSerial {
  issuerName: string;
  serialNumber: string;
}

/**
 * Represents an <X509Data> sub element of an XMLDSIG or XML Encryption <KeyInfo> element.
 */
@XmlElement({
  localName: XmlSignature.ElementNames.X509Data,
})
export class KeyInfoX509Data extends KeyInfoClause {
  private x509crl: Uint8Array | null = null;
  private IssuerSerialList: IX509IssuerSerial[];
  private SubjectKeyIdList: Uint8Array[] = [];
  private SubjectNameList: string[];
  private X509CertificateList: X509Certificate[];

  public constructor();
  public constructor(rgbCert: Uint8Array);
  public constructor(cert: X509Certificate, includeOptions?: X509IncludeOption);
  public constructor(cert?: any, includeOptions = X509IncludeOption.None) {
    super();
    if (cert) {
      if (cert instanceof Uint8Array) {
        this.AddCertificate(new X509Certificate(cert));
      } else if (cert instanceof X509Certificate) {
        switch (includeOptions) {
          case X509IncludeOption.None:
          case X509IncludeOption.EndCertOnly:
            this.AddCertificate(cert);
            break;
          case X509IncludeOption.ExcludeRoot:
            this.AddCertificatesChainFrom(cert, false);
            break;
          case X509IncludeOption.WholeChain:
            this.AddCertificatesChainFrom(cert, true);
            break;
        }
      }
    }
  }

  public async importKey(_key: CryptoKey): Promise<this> {
    throw new XmlError(XE.METHOD_NOT_SUPPORTED);
  }

  /**
   * Exports key from X509Data object
   * @param  {Algorithm} alg
   * @returns Promise
   */
  public async exportKey(alg?: RsaHashedImportParams | EcKeyImportParams) {
    if (!this.Certificates.length) {
      throw new XmlError(XE.NULL_REFERENCE);
    }
    this.Key = await this.Certificates[0].exportKey(alg);

    return this.Key;
  }

  /**
   * Gets a list of the X.509v3 certificates contained in the KeyInfoX509Data object.
   */
  public get Certificates(): X509Certificate[] {
    return this.X509CertificateList;
  }

  /**
   * Gets or sets the Certificate Revocation List (CRL) contained within the KeyInfoX509Data object.
   */
  public get CRL() {
    return this.x509crl;
  }

  public set CRL(value: Uint8Array | null) {
    this.x509crl = value;
  }

  /**
   * Gets a list of X509IssuerSerial structures that represent
   * an issuer name and serial number pair.
   */
  public get IssuerSerials(): IX509IssuerSerial[] {
    return this.IssuerSerialList;
  }

  /**
   * Gets a list of the subject key identifiers (SKIs) contained in the KeyInfoX509Data object.
   */
  public get SubjectKeyIds(): Uint8Array[] {
    return this.SubjectKeyIdList;
  }

  /**
   * Gets a list of the subject names of the entities contained in the KeyInfoX509Data object.
   */
  public get SubjectNames(): string[] {
    return this.SubjectNameList;
  }

  /**
   * Adds the specified X.509v3 certificate to the KeyInfoX509Data.
   * @param  {X509Certificate} certificate
   * @returns void
   */
  public AddCertificate(certificate: X509Certificate): void {
    if (!certificate) {
      throw new XmlError(XE.PARAM_REQUIRED, 'certificate');
    }
    if (!this.X509CertificateList) {
      this.X509CertificateList = [];
    }
    this.X509CertificateList.push(certificate);
  }

  /**
   * Adds the specified issuer name and serial number pair to the KeyInfoX509Data object.
   * @param  {string} issuerName
   * @param  {string} serialNumber
   * @returns void
   */
  public AddIssuerSerial(issuerName: string, serialNumber: string): void {
    if (issuerName == null) {
      throw new XmlError(XE.PARAM_REQUIRED, 'issuerName');
    }
    if (this.IssuerSerialList == null) {
      this.IssuerSerialList = [];
    }

    const xis = { issuerName, serialNumber };
    this.IssuerSerialList.push(xis);
  }

  /**
   * Adds the specified subject key identifier (SKI) to the KeyInfoX509Data object.
   * @param  {string | Uint8Array} subjectKeyId
   * @returns void
   */
  public AddSubjectKeyId(subjectKeyId: string | Uint8Array): void {
    if (this.SubjectKeyIdList) {
      this.SubjectKeyIdList = [];
    }

    if (typeof subjectKeyId === 'string') {
      if (subjectKeyId != null) {
        const id = Convert.FromBase64(subjectKeyId);
        this.SubjectKeyIdList.push(id);
      }
    } else {
      this.SubjectKeyIdList.push(subjectKeyId);
    }
  }

  /**
   * Adds the subject name of the entity that was issued an X.509v3 certificate
   * to the KeyInfoX509Data object.
   * @param  {string} subjectName
   * @returns void
   */
  public AddSubjectName(subjectName: string): void {
    if (this.SubjectNameList == null) {
      this.SubjectNameList = [];
    }

    this.SubjectNameList.push(subjectName);
  }

  /**
   * Returns an XML representation of the KeyInfoX509Data object.
   * @returns Element
   */
  public GetXml(): Element {
    const doc = this.CreateDocument();
    const xel = this.CreateElement(doc);

    const prefix = this.GetPrefix();

    // <X509IssuerSerial>
    if (this.IssuerSerialList != null && this.IssuerSerialList.length > 0) {
      this.IssuerSerialList.forEach((iser) => {
        const isl = doc.createElementNS(
          XmlSignature.NamespaceURI,
          prefix + XmlSignature.ElementNames.X509IssuerSerial,
        );
        const xin = doc.createElementNS(
          XmlSignature.NamespaceURI,
          prefix + XmlSignature.ElementNames.X509IssuerName,
        );
        xin.textContent = iser.issuerName;
        isl.appendChild(xin);
        const xsn = doc.createElementNS(
          XmlSignature.NamespaceURI,
          prefix + XmlSignature.ElementNames.X509SerialNumber,
        );
        xsn.textContent = iser.serialNumber;
        isl.appendChild(xsn);
        xel.appendChild(isl);
      });
    }
    // <X509SKI>
    if (this.SubjectKeyIdList != null && this.SubjectKeyIdList.length > 0) {
      this.SubjectKeyIdList.forEach((skid) => {
        const ski = doc.createElementNS(
          XmlSignature.NamespaceURI,
          prefix + XmlSignature.ElementNames.X509SKI,
        );
        ski.textContent = Convert.ToBase64(skid);
        xel.appendChild(ski);
      });
    }
    // <X509SubjectName>
    if (this.SubjectNameList != null && this.SubjectNameList.length > 0) {
      this.SubjectNameList.forEach((subject) => {
        const sn = doc.createElementNS(
          XmlSignature.NamespaceURI,
          prefix + XmlSignature.ElementNames.X509SubjectName,
        );
        sn.textContent = subject;
        xel.appendChild(sn);
      });
    }
    // <X509Certificate>
    if (this.X509CertificateList != null && this.X509CertificateList.length > 0) {
      this.X509CertificateList.forEach((x509) => {
        const cert = doc.createElementNS(
          XmlSignature.NamespaceURI,
          prefix + XmlSignature.ElementNames.X509Certificate,
        );
        cert.textContent = Convert.ToBase64(x509.GetRaw());
        xel.appendChild(cert);
      });
    }
    // only one <X509CRL>
    if (this.x509crl != null) {
      const crl = doc.createElementNS(
        XmlSignature.NamespaceURI,
        prefix + XmlSignature.ElementNames.X509CRL,
      );
      crl.textContent = Convert.ToBase64(this.x509crl);
      xel.appendChild(crl);
    }
    return xel;
  }

  /**
   * Parses the input XmlElement object and configures the internal state
   * of the KeyInfoX509Data object to match.
   * @param  {Element} element
   * @returns void
   */
  public LoadXml(element: Element): void {
    super.LoadXml(element);

    if (this.IssuerSerialList) {
      this.IssuerSerialList = [];
    }
    if (this.SubjectKeyIdList) {
      this.SubjectKeyIdList = [];
    }
    if (this.SubjectNameList) {
      this.SubjectNameList = [];
    }
    if (this.X509CertificateList) {
      this.X509CertificateList = [];
    }
    this.x509crl = null;

    // <X509IssuerSerial>
    let xnl = this.GetChildren(XmlSignature.ElementNames.X509IssuerSerial);
    if (xnl) {
      xnl.forEach((xel) => {
        const issuer = XmlSignatureObject.GetChild(
          xel,
          XmlSignature.ElementNames.X509IssuerName,
          XmlSignature.NamespaceURI,
          true,
        );
        const serial = XmlSignatureObject.GetChild(
          xel,
          XmlSignature.ElementNames.X509SerialNumber,
          XmlSignature.NamespaceURI,
          true,
        );
        if (issuer && issuer.textContent && serial && serial.textContent) {
          this.AddIssuerSerial(issuer.textContent, serial.textContent);
        }
      });
    }
    // <X509SKI>
    xnl = this.GetChildren(XmlSignature.ElementNames.X509SKI);
    if (xnl) {
      xnl.forEach((xel) => {
        if (xel.textContent) {
          const skid = Convert.FromBase64(xel.textContent);
          this.AddSubjectKeyId(skid);
        }
      });
    }
    // <X509SubjectName>
    xnl = this.GetChildren(XmlSignature.ElementNames.X509SubjectName);
    if (xnl != null) {
      xnl.forEach((xel) => {
        if (xel.textContent) {
          this.AddSubjectName(xel.textContent);
        }
      });
    }
    // <X509Certificate>
    xnl = this.GetChildren(XmlSignature.ElementNames.X509Certificate);
    if (xnl) {
      xnl.forEach((xel) => {
        if (xel.textContent) {
          const cert = Convert.FromBase64(xel.textContent);
          this.AddCertificate(new X509Certificate(cert));
        }
      });
    }
    // only one <X509CRL>
    const x509el = this.GetChild(XmlSignature.ElementNames.X509CRL, false);
    if (x509el && x509el.textContent) {
      this.x509crl = Convert.FromBase64(x509el.textContent);
    }
  }

  // this gets complicated because we must:
  // 1. build the chain using a X509Certificate2 class;
  // 2. test for root using the Mono.Security.X509.X509Certificate class;
  // 3. add the certificates as X509Certificate instances;
  private AddCertificatesChainFrom(_cert: X509Certificate, _root: boolean): void {
    // TODO: Implement certificate chain loading
  }
}
