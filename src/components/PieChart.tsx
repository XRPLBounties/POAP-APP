import { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";

type PieChartProps = {
  height?: string | number;
  series: number[];
  labels: string[];
};

function PieChart({ height, series, labels }: PieChartProps) {
  const options: ApexOptions = {
    chart: {
      height: height,
      type: "pie",
    },
    legend: {
      width: 110,
    },
    labels: labels,
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  return (
    <ReactApexChart
      options={options}
      series={series}
      type={options.chart?.type}
      height={options.chart?.height}
    />
  );
}

export default PieChart;
