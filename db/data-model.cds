using {
  cuid,
  managed
} from '@sap/cds/common';

namespace uploader;

entity azure : cuid, managed {
  base64   : String;
  folder   : String(100);
  filename : String(40);
  response : String(50)
}