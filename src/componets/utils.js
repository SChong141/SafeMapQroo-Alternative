// src/components/utils.js

export function occupancyBadge(occupied, capacity, available) {
  if (available === false) {
    return {
      text: "No disponible",
      className: "bg-red-100 text-red-800",
      borderClass: "border-red-400",
    };
  }
  if (!capacity) {
    return {
      text: "—",
      className: "bg-gray-200 text-gray-800",
      borderClass: "border-gray-300",
    };
  }
  const ratio = occupied / capacity;
  if (ratio >= 1) {
    return {
      text: "Lleno",
      className: "bg-red-100 text-red-800",
      borderClass: "border-red-400",
    };
  }
  if (ratio >= 0.8) {
    return {
      text: "Casi lleno",
      className: "bg-orange-100 text-orange-800",
      borderClass: "border-orange-400",
    };
  }
  return {
    text: "Disponible",
    className: "bg-green-100 text-green-800",
    borderClass: "border-green-400",
  };
}

export function exportCSV(shelters, employees) {
  const rows = [];
  rows.push(
    [
      "Albergue ID",
      "Albergue Nombre",
      "Empleado ID",
      "Empleado Nombre",
      "Rol",
      "Teléfono",
    ].join(",")
  );

  shelters.forEach((s) => {
    const emps = employees.filter((e) => e.shelterId === s.id);
    if (emps.length === 0)
      rows.push([s.id, `"${s.name}"`, "", "", "", ""].join(","));
    else
      emps.forEach((e) =>
        rows.push(
          [
            s.id,
            `"${s.name}"`,
            e.id,
            `"${e.name}"`,
            `"${e.role}"`,
            `"${e.phone}"`,
          ].join(",")
        )
      );
  });

  const csv = rows.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "albergues_empleados_export.csv";
  a.click();
  URL.revokeObjectURL(url);
}
