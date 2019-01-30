# atlasboard-sonarcloud
Atlasboard Sonarcloud helps displaying quality overall status of
related projects.

![sonarcloud-card](images/sonarcloud-card.png?raw=true "sonarcloud-card")

![sonarcloud-card-popup](images/sonarcloud-card-popup.png?raw=true "sonarcloud-card-popup")


# license
Licensed under the GNU Lesser General Public License

# installation
This package is available as a git submodule.
See [Package-Atlassian](https://bitbucket.org/atlassian/atlasboard/wiki/Package-Atlassian) how to include it in your wallboards.

# Widget

## sonarqube
This widget is like sonarqube dashboard with some modifications.
Related bugs will be easily display if clicked on the card.


## configuration

For your dashboard please look at the example.json
If you want to see more than one project, better to define another sonarcloud-card in your dashboard.


# notes
* You can define direct link to your sonarcloud project inside the sonarcloud.html file
![sonarcloud-html](images/sonarcloud-html.png?raw=true "sonarcloud-html")

* give sonarcloud url like this given below
```
   http://token@sonarcloud.io    
```

# issues
* sonarcloud-card code smell rating value is not properly set.
* coverage image doesnt properly display overall coverage.
* duplication image doesnt properly display overall coverage.
* project size image doesnt properly display overall size.
