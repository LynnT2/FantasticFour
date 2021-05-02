# Updated Proposal

## Introduction
The COVID-19 pandemic has sparked an uptick in Asian American attacks throughout the US. The Fantastic Four is utilizing web mapping to illustrate the historical and contemporary patterns of these hate crimes.

## Team Members

### Labiba Alam
<br>
    <img src = "img/Labiba.jpg" width = "200">
<br>
    Role: Powerpoint designer, coder for about us page, email correspondent
<br>
    Labiba is a senior majoring in Bioengineering with a technical breadth in Digital Humanities. As a person who is more exposed to the effects of Covid-19 from a scientific point-of-view, she wants to tackle Covid-19’s correlation to the rise of Asian American hate crimes as a humanities topic for a change of perspective.

### Haiqi Zhou
<br>
    <img src = "img/Haiqi.jpg" width = "200">
<br>
    Role: Contributor 
<br>
    Haiqi is a junior double majoring in Art History and French and minoring in Digital Humanities. She is interested in topics related to the environment and human rights. As someone born and raised in Shenzhen, China, she is very concerned about the rising incidents of anti-Asian hate crimes and would like to learn more about different factors that could have contributed to the increase in anti-Asian hate crimes.
  
### Adriana Romero
<br>
    <img src = "img/Adriana.jpg" width = "200">
<br>
    Role: Data Analyst, Coder for About Us Page
<br>
Adriana Romero is a senior majoring in Sociology and minoring in Public Affairs. Adriana’s field of study and lived experiences have made her passionate about dismantling institutional forms of racism that produce inequalities that negatively impact marginalized communities. In the past few years, she has studied the patterns anti-Asian policies and practices in the United States. She is disgusted by the rise in hate crimes directed towards Asian communities and believes that it is important to address the numerous historical and present factors that contribute to it. 

### Lynn Tieu
<br>
    <img src = "img/Lynn.JPG" width = "200">
<br>
    Role: UX Designer, Data Analyst
<br>
    Lynn Tieu is in her final year as an Economics major and Digital Humanities minor. As a Chinese Vietnamese American, she has a personal interest in the patterns of Asian hate and discrimination. She aims to use her technical skills in UX design and data analytics to create a useful resource for those who want to understand more about the hate crimes committed against Asian Americans.

## Overview
The United States has witnessed an increase in violence against Asian communities since the beginning of the COVID-19 pandemic, a result of the initial detection of the virus in Wuhan, China. Although the recent escalation of hate crimes is substantial, racism directed towards Asians has been prevalent in the U.S since the 19th century. Anti-Asian policies, ideologies, and varying forms of violent actions are defining features of American history. Identifying and acknowledging important historical events related to Asian-Americans allows us to frame the current brutality of hate crimes faced by Asian communities.

Our goal is to investigate different patterns of Asian American hate crimes throughout the U.S. in the past two years; specifically considering the location of the hate crime and the age, gender, and nationality of victims. We intend on using our historical data to understand past patterns of institutional and personal discrimination against Asians in the U.S. Historical patterns of interest include the rates of Asian discrimination during each century, specific events that sparked an increase in anti-Asian sentiment, and differences in the prevalence of Asian hate crimes across regions. The spikes in Asian hate crimes over the past few years demonstrate the continuation of historical anti-Asian sentiments in the country. It is important to recognize the patterns and consistency of Asian discrimination. 
## Methodology 
Web mapping is our main methodology to visualizing our data. Asian American hate attacks are unfortunately high in frequency and span across the US, making the data hard to understand without visualization. Web mapping is essential to understanding the scope of these crimes, and to illustrate the Asian American presence in the US. Web-mapping allows for a more user-friendly experience to understand the key takeaways. 
## Workflow
<table>
  <tr>
    <th>Milestone</th>
    <th>Phase</th>
  </tr>
  <tr>
    <td>Week 2</td>
    <td>Establish problem statements and research questions. Complete project proposal.</td>
  </tr>
  <tr>
    <td>Week 3</td>
    <td>Create the lofi storyboard of a web map.</td>
  </tr>
  <tr>
    <td>Week 4</td>
    <td>Find and create reliable datasets to visualize.</td>
  </tr>
  <tr>
    <td>Week 5</td>
    <td>Propose the incorporation of additional interactivity in the form of data filters, time sliders, etc.</td>
  </tr>
  <tr>
    <td>Week 6</td>
    <td>Prepare to present for midterm presentation.</td>
  </tr>
  <tr>
    <td>Week 7</td>
    <td>Implement a choropleth map with census data.</td>
  </tr>
  <tr>
    <td> Week 8</td>
    <td>Map “live” data if necessary.</td>
  </tr>
   </tr>
  <tr>
    <td> Week 9</td>
    <td>Incorporate temporal data.</td>
  </tr>
  <tr>
    <td> Week 10</td>
    <td>Finalize charts and display metrics.</td>
  </tr>
  <tr>
    <td> Week 11</td>
    <td>Finalize project website and presentation layout.</td>
  </tr>
</table>
<br>

## Technical Scope 
Our website is based from GitHub, and is created with HTML, Javascript, and CSS. We are collaborating remotely with the help of Git. Leaflet is our map source for our mapping visualizations, and our additional visualizations are created with Tableau or Python. 
## Data Plan
### Survey Data
We are surveying people of Asian ethnicity to understand their experiences in the US. Data is collected via Google Forms. The data is used to visualize the patterns in our survey takers’ accounts, through bar and line charts that tell us the experience (first-hand or witness) of people in recent times. Because we haven't designed our survey yet, our results are to be determined. Nevertheless, the survey will give us useful information on people's opinions and experiences.

### Historical Data
https://www.history.com/topics/immigration/asian-american-timeline
http://www.cetel.org/timeline.html

Notable historical events in Asian American history have been manually pulled from the sites above and consolidated into a csv dataset that is geocoded alongside the data gathered from the survey and the NYT article. This dataset is our primary source for our site timeline, and traces back the discrimination Asian Americans have had to face in the US.
### New York Times Article Data
https://www.nytimes.com/interactive/2021/04/03/us/anti-asian-attacks.html

The New York Times reported over 100 anti-Asian attacks in the article, “"Swelling Anti-Asian Violence: Who Is Being Attacked Where". Although it is not a full account of all of the Anti-Asian violence in the US, it provides an overview of these events in the past year. Because we do not have a specific coordinate of the place where the attack happened, however, the coordinates shown on our map might not be precisely pinned. We will create a timeline based on the date given by the data. We will also create a bar chart that shows the victims by gender, age, and ethnicity.
