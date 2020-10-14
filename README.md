Challenge: create a component using the echarts api.

The component should be a graph comparing data blood pressure data to number of steps walked over time.
- Blood pressure data is taken at random an average of 5 times per week, and includes systolic and diastolic readings. There can be more than one data point per day.
- Steps walked has one entry per day, with more on average during the weekends.
- There may be a loose inverse correlation between blood pressure data and number of steps walked.

Include output tables for all data points, one for steps and one for blood pressure

Add the ability to add and remove blood pressure data points
Add the ability to edit step data points 

Input fields ([date, time, systolic, diastolic] for bp, [date, value] for steps) should utilize a custom validation JS library, which should validate dates and numbers.
  - Validation parameters should be appended to HTML elements as custom attributes
