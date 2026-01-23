// // src/components/SpendingChart.js
// import React from 'react';
// import { Dimensions, View } from 'react-native';
// import { BarChart } from 'react-native-chart-kit';

// const screenWidth = Dimensions.get('window').width - 48;

// const SpendingChart = ({ chartData, isDark }) => {
//   return (
//     <View>
//       <BarChart
//         data={{
//           labels: chartData.labels,
//           datasets: [{ data: chartData.data }],
//         }}
//         width={screenWidth}
//         height={220}
//         fromZero
//         withInnerLines={false}
//         showValuesOnTopOfBars
//         chartConfig={{
//           backgroundGradientFrom: isDark ? '#020617' : '#FFFFFF',
//           backgroundGradientTo: isDark ? '#020617' : '#FFFFFF',
//           decimalPlaces: 0,
//           color: () => '#2563EB',
//           labelColor: () => (isDark ? '#CBD5E1' : '#475569'),
//           barPercentage: 0.55,
//         }}
//         style={{
//           borderRadius: 16,
//         }}
//       />
//     </View>
//   );
// };

// export default React.memo(SpendingChart);


// src/components/SpendingChart.js
import React from 'react';
import { Dimensions, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width - 32;

const SpendingChart = ({ chartData, isDark }) => {
    return (
        <View>
            <BarChart
                data={{
                    //   labels: ['Food', 'Travel', 'Bills', 'Shopping'],
                    labels: chartData.labels,
                    datasets: [{ data: chartData.data }],
                }}
                width={screenWidth}
                height={220}
                fromZero
                showValuesOnTopOfBars
                chartConfig={{
                    backgroundGradientFrom: isDark ? '#020617' : '#ffffff',
                    backgroundGradientTo: isDark ? '#020617' : '#ffffff',
                    decimalPlaces: 0,
                    color: () => '#2563EB',
                    labelColor: () => (isDark ? '#CBD5E1' : '#475569'),
                    barPercentage: 0.55,
                }}
                style={{ borderRadius: 16 }}
            />
        </View>
    );
};

export default SpendingChart;
