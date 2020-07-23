export const fileReaderHelper = (blob) => {
  const fileReader = new FileReader();

  return new Promise((resolve, reject) => {
    fileReader.onerror = () => {
      reject(new Error("Couldn't parse blob"));
    };

    fileReader.onload = () => {
      resolve(fileReader.result);
    };

    fileReader.readAsText(blob);
  });
};
