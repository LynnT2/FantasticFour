# Data Plan Update for the Fantastic Four

## Data 

Personal survey data collected from social media e.g., Facebook groups
- Still to be collected

Historical events links: 
- https://www.history.com/topics/immigration/asian-american-timeline,
- http://www.cetel.org/timeline.html


NY Times article <i>"Swelling Anti-Asian Violence: Who Is Being Attacked Where"</i> link:
- https://www.nytimes.com/interactive/2021/04/03/us/anti-asian-attacks.html


## How Data Will Be Used and Collected 

Personal Survey Data
- Data will be collected and documented, then downloaded as a csv and geocoded using Javascript.
We will use the survey data to create bar charts that tell us the experience (first-hand or witness) of people in recent times. Because we haven't designed our survey yet, our results are to be determined. Nevertheless, the survey will give us useful information on people's opinions and experiences.

Historical Events Data
- Notable historical events in Asian American history will be manually pulled from websites and other resources and consolidated into a csv dataset that will be geocoded, using Javascript, alongside the data gathered from the survey and the NYT article. 

NY Times Article 
- The article will be downloaded as a csv and geocoded using Python. Since the data is collected by NY Times we believe that it is pretty comprehensive. Of course, the 100+ anti-Asian attacks shown here are only the ones that are reported, they still give an overview of how hate crimes are distributed in the U.S. in the last year. Because we do not have a specific coordinate of the place where the attack happened, however, the coordinates shown on our map might not be precisely pinned. We will create a timeline based on the date given by the data. We will also create a bar chart that shows the victims by gender, age, and ethnicity.
