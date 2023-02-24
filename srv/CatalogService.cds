using { uploader } from '../db/data-model';

service CatalogService @( path : '/UploadAzure'){

    entity azure as projection on uploader.azure;

}