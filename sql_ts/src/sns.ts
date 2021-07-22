interface Sns {
  Message: string;
}

interface Record {
  Sns: Sns;
}

export interface SnsEvent {
  Records: Record[];
}
