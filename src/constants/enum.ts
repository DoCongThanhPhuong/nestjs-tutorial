export enum EEnvironment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

export enum EQuerySort {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum EMethod {
  POST = 'POST',
  GET = 'GET',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export enum ESubmissionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum EGender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum EFieldType {
  NUMBER = 'number',
  TEXT = 'text',
  DATE = 'date',
  UPLOAD = 'upload',
  SELECT = 'select',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
}

export enum EFormTypeScope {
  ALL = 'all',
  PROBATION = 'probation',
  PERMANENT = 'permanent',
}

export enum EUserStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}
