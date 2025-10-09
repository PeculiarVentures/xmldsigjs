import { ITransformConstructable } from './transform.js';
import {
  XmlDsigBase64Transform,
  XmlDsigC14NTransform,
  XmlDsigC14NWithCommentsTransform,
  XmlDsigEnvelopedSignatureTransform,
  XmlDsigExcC14NTransform,
  XmlDsigExcC14NWithCommentsTransform,
} from './transforms/index.js';
import { XmlSignature } from './xml_names.js';

class TransformRegistry extends Map<string, ITransformConstructable> {}

export const transformRegistry = new TransformRegistry();

// Register default transforms
transformRegistry.set(
  XmlSignature.AlgorithmNamespaces.XmlDsigBase64Transform,
  XmlDsigBase64Transform,
);
transformRegistry.set(XmlSignature.AlgorithmNamespaces.XmlDsigC14NTransform, XmlDsigC14NTransform);
transformRegistry.set(
  XmlSignature.AlgorithmNamespaces.XmlDsigC14NWithCommentsTransform,
  XmlDsigC14NWithCommentsTransform,
);
transformRegistry.set(
  XmlSignature.AlgorithmNamespaces.XmlDsigEnvelopedSignatureTransform,
  XmlDsigEnvelopedSignatureTransform,
);
transformRegistry.set(
  XmlSignature.AlgorithmNamespaces.XmlDsigExcC14NTransform,
  XmlDsigExcC14NTransform,
);
transformRegistry.set(
  XmlSignature.AlgorithmNamespaces.XmlDsigExcC14NWithCommentsTransform,
  XmlDsigExcC14NWithCommentsTransform,
);
