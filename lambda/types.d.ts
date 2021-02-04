declare type Note = {
  id: string;
  name: string;
  completed: boolean;
};

declare type AppSyncEvent = {
  info: {
    fieldName: string;
  };
  arguments: {
    noteId: string;
    note: Note;
  };
};
