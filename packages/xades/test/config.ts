import { Crypto } from '@peculiar/webcrypto';
import '../../core/test/config.js';
import * as xades from '../src/index.js';

// Set crypto to XML application
xades.Application.setEngine('NodeJS', new Crypto());
