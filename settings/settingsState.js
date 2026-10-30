const inspection = localStorage.getItem("inspectionType") || "WCA";

const timerSettObj = {
  inspectionType: inspection,
  timerFlag: false,
  previousInspectionType: inspection
};

export { timerSettObj };
