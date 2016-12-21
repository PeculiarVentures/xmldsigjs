## RSASSA-PKCS1 v1.5

__JWK key__

```javascript
{ 
  kty: 'RSA',
  key_ops: [ 'verify' ],
  e: 'AQAB',
  n: 'n9fuPR0Gs36mNsosfKgQgBqE6blT_SBqgTFuBJMW_1I6ZYTSzdPyORRRKI7ON9I69nIixnCXTeBGXIS1ZVJd0QWlW83Hf3zb_EOWTK7tR44jFe9iRFHiiPkURJuJ501oZNkK-SPuK4XHZAG9sec_KjQqfxlVDELGsq0E7A89_5M',
  alg: 'RS256',
  ext: true 
}
```

__XML key__

```xml
<ds:RSAKeyValue>
  <ds:Modulus>n9fuPR0Gs36mNsosfKgQgBqE6blT/SBqgTFuBJMW/1I6ZYTSzdPyORRRKI7ON9I69nIixnCXTeBGXIS1ZVJd0QWlW83Hf3zb/EOWTK7tR44jFe9iRFHiiPkURJuJ501oZNkK+SPuK4XHZAG9sec/KjQqfxlVDELGsq0E7A89/5M=</ds:Modulus>
  <ds:Exponent>AQAB</ds:Exponent>
</ds:RSAKeyValue>
```

## RSA-PSS

__JWK key__

```javascript
{
  kty: 'RSA',
  key_ops: [ 'verify' ],
  e: 'AQAB',
  n: '0qrLpehdT0OD5YT4n4S0wAOTBPD4PpLXkOO2fahqiLrPQZlTzeIAyXRuEmGjow2ctzCLVMKYRZ3f68CrnUkZvrqNDRr8aheagoEnWX_1UfgnvcfIPR1JC3-de8EWAJ8_MpCtVR9Z9H81jQhRCvAX9ihGbeNz8gHDzdK5wYvRIaE',
  alg: 'PS256',
  ext: true 
}
```

__XML key__

```xml
<ds:SignatureMethod Algorithm="http://www.w3.org/2007/05/xmldsig-more#rsa-pss">
  <pss:RSAPSSParams xmlns:pss="http://www.w3.org/2007/05/xmldsig-more#">
    <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
    <pss:SaltLength>24</pss:SaltLength>
  </pss:RSAPSSParams>
</ds:SignatureMethod>

<ds:RSAKeyValue>
  <ds:Modulus>0qrLpehdT0OD5YT4n4S0wAOTBPD4PpLXkOO2fahqiLrPQZlTzeIAyXRuEmGjow2ctzCLVMKYRZ3f68CrnUkZvrqNDRr8aheagoEnWX/1UfgnvcfIPR1JC3+de8EWAJ8/MpCtVR9Z9H81jQhRCvAX9ihGbeNz8gHDzdK5wYvRIaE=</ds:Modulus>
  <ds:Exponent>AQAB</ds:Exponent>
</ds:RSAKeyValue>
```

## ECDSA

__JWK key__

```javascript
{ 
  kty: 'EC',
  crv: 'P-256',
  key_ops: [ 'verify' ],
  x: 'CToRMJSXwQAHCEo_z2eSOvbedNF8ce-bG0wTPIFGV-M',
  y: '3_w1iiV_9B33BzKmrqDVIZt13MQeQ2TC230g8gGntRU' 
}
```

__XML key__

```xml
<ecdsa:ECDSAKeyValue xmlns:ecdsa="http://www.w3.org/2001/04/xmldsig-more#">
  <ecdsa:DomainParameters>
    <ecdsa:NamedCurve URI="urn:oid:1.2.840.10045.3.1.7"/>
  </ecdsa:DomainParameters>
  <ecdsa:PublicKey>
    <ecdsa:X>CToRMJSXwQAHCEo/z2eSOvbedNF8ce+bG0wTPIFGV+M=</ecdsa:X>
    <ecdsa:Y>3/w1iiV/9B33BzKmrqDVIZt13MQeQ2TC230g8gGntRU=</ecdsa:Y>
  </ecdsa:PublicKey>
</ecdsa:ECDSAKeyValue>
```