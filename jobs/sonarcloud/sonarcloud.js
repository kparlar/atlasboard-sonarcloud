module.exports = function (config, dependencies, job_callback) {
  let async = require('async');
  let logger = dependencies.logger;

  let dashboardUrl = `${config.serverUrl}/dashboard?id=${config.resource}`
   //gets project status
  let projectStatusUrl = `${config.serverUrl}/api/qualitygates/project_status?projectKey=${config.resource}`;
  //gets the last analysis
  let analysisUrl = `${config.serverUrl}/api/project_analyses/search?project=${config.resource}&p=1&ps=1`;
  //gets metrics
  let metricsUrl = `${config.serverUrl}/api/measures/component?metricKeys=bugs,coverage,code_smells,vulnerabilities,ncloc,duplicated_lines_density,ncloc_language_distribution&componentKey=${config.resource}`;
  //get count and rating for bugs
  let countAndRatingBugUrl = `${config.serverUrl}/api/issues/search?facets=severities&types=BUG&statuses=OPEN,REOPENED&componentKeys=${config.resource}`;
  //get count and rating for vulnerability
  let countAndRatingVulnerabilityUrl = `${config.serverUrl}/api/issues/search?facets=severities&types=VULNERABILITY&statuses=OPEN,REOPENED&componentKeys=${config.resource}`;
  //get ratingsForCodeSmell
  //let ratingCodeSmellUrl = `${config.serverUrl}/api/issues/search?facets=severities&types=CODE_SMELL&statuses=OPEN,REOPENED&onComponentOnly=true&componentKeys=${config.resource}`;



   let mapOfMetrics = [
   {
    'metricKey': 'duplicated_lines_density',
    'metricText': 'Duplicated Lines'
   },
   {
     'metricKey': 'code_smells',
     'metricText': 'Code Smells'
    },
    {
     'metricKey': 'security_rating',
     'metricText': 'Security Rating'
    },
    {
      'metricKey': 'vulnerabilities',
      'metricText': 'Vulnerabilities'
     }
     ,
     {
      'metricKey': 'new_duplicated_lines',
      'metricText': 'Duplicated Lines on New Code'
     },
     {
      'metricKey': 'new_reliability_rating',
      'metricText': 'Reliability Rating on New Code'
     },
      {
       'metricKey': 'new_maintainability_rating',
       'metricText': 'Maintainability Rating on New Code'
      }
  ];


  let credentials = config.credentials;



  let _ = dependencies.underscore;
  let moment = dependencies.moment;
  let authorization;
  if (config.globalAuth && config.globalAuth[credentials] && config.globalAuth[credentials].username && config.globalAuth[credentials].password) {
      let authorizationHash = new Buffer(config.globalAuth[credentials].username + ':' + config.globalAuth[credentials].password).toString('base64');
      var message = "hash: "+authorizationHash;
      authorization = `Basic ${authorizationHash}`;
   }


  function getLastAnalysis(param, callback){
    let options = {
      url:analysisUrl,
      rejectUnauthorized: false,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if(authorization){
      options.headers.Authorization = authorization;
    }

     dependencies.easyRequest.JSON(options, function (error, response) {
         let responseLastAnalysis = {
            lastAnalysisDate: "None"
         };
          if(response.analyses){
            responseLastAnalysis.lastAnalysisDate = response.analyses[0].date;

         }else{
            responseLastAnalysis.lastAnalysisDate = "Not Found!"
         }
         callback(null, responseLastAnalysis.lastAnalysisDate);
     });

  };

  function getMetrics(param, callback){

      let options = {
        url:metricsUrl,
        rejectUnauthorized: false,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if(authorization){
        options.headers.Authorization = authorization;
      }

       dependencies.easyRequest.JSON(options, function (error, response) {
        callback(null, response);
       });

    };

  function getCountAndRatingForBugsOrVulnerability(param, callback){

    let options = {
        url:param,
        rejectUnauthorized: false,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      if(authorization){
        options.headers.Authorization = authorization;
      }

       dependencies.easyRequest.JSON(options, function (error, response) {
            let responseData = {};
            let ratingValue = '?';
            let countValue = 0;
            logger.info("error: " + error)
            if(error){
              //do nothing
            }else{
                if(response.facets){
                    ratingValue = 'A';
                    _.each(response.facets[0].values, function (severity) {
                       if(severity.count > 0){
                           countValue += severity.count;
                           if(severity.val == 'BLOKER'){
                                ratingValue = 'E';
                           }else if(severity.val == 'CRITICAL' && ratingValue != 'E'){
                                ratingValue = 'D';
                           }else if(severity.val == 'MAJOR' && ratingValue != 'E' && ratingValue != 'D'){
                                ratingValue = 'C';
                           }else if(severity.val == 'MINOR' && ratingValue != 'E' && ratingValue != 'D' && ratingValue != 'C'){
                                ratingValue = 'B';
                           }else if(severity.val == 'INFO'  && ratingValue != 'E' && ratingValue != 'D' && ratingValue != 'C' && ratingValue != 'B'){
                               //do nothing
                           }
                       }else{
                        //continue;
                       }
                  });
                }else{
                     //do nothing
                }
            }

           responseData.ratingValue = ratingValue;
           responseData.countValue = countValue;
           callback(null, responseData);
       });
  }

  var options = {
    //url: metricsUrl,
    url: projectStatusUrl,
    rejectUnauthorized: false,
    headers: {
      'Content-Type': 'application/json'
    }
  };


  if(authorization){
     logger.info("here 1 authorization "+authorization);
        options.headers.Authorization = authorization;
  }else{
     logger.info("here 1 no authorization ");
  }


  function getMetricOfBug(metricsData){
    return getMetric(metricsData, 'bugs');
  }
  function getMetricOfVulnerability(metricsData){
      return getMetric(metricsData, 'vulnerabilities');
  }
  function getMetricOfCodeSmell(metricsData){
        return getMetric(metricsData, 'code_smells');
  }
  function getMetricOfCoverage(metricsData){
          return getMetric(metricsData, 'coverage');
  }
  function getMetricOfDuplicatedLineDensity(metricsData){
          return getMetric(metricsData, 'duplicated_lines_density');
  }
  function getMetricOfLinesOfCode(metricsData){
          return getMetric(metricsData, 'ncloc');
  }
  function getMetricOfLinesOfCodeLanguageDistribution(metricsData){
          return getMetric(metricsData, 'ncloc_language_distribution');
  }


  function getMetric(measures, key) {
      return _.first(_.where(measures, {metric: key}))
    };

  dependencies.easyRequest.JSON(options, function (error, qualityGates) {

    if (error) {
      let err_msg = error || `ERROR: Couldn't access the metrics at ${options.url}`;
      logger.error(err_msg);
      return job_callback(err_msg);
    }


    let measures = qualityGates.projectStatus.measures;
    //let coverages = getCoverage(qualityGates);
    let vulnerabilities = "test";


    var param = [];
    param[0] = 'test';
    async.map(param, getLastAnalysis, function (err, lastAnalysisDate) {


        //TODO FORMAT like this December 21, 2018, 3:39 PM -
        logger.info("responseData: "+lastAnalysisDate);

        async.map(param, getMetrics, function (err, metricResponse) {
            //logger.info("metricBug: "+metricResponse[0].component.id);
            let metricBug = getMetricOfBug(metricResponse[0].component.measures)
            //logger.info("metricBug-value: "+metricBug.value);
            //logger.info("metricBug-metric: "+metricBug.metric);
            let metricVulnerability = getMetricOfVulnerability(metricResponse[0].component.measures)
            let metricCodeSmell = getMetricOfCodeSmell(metricResponse[0].component.measures)
            let metricCoverage = getMetricOfCoverage(metricResponse[0].component.measures)
            let metricDuplicatedLineDensity = getMetricOfDuplicatedLineDensity(metricResponse[0].component.measures)
            let metricLinesOfCode = getMetricOfLinesOfCode(metricResponse[0].component.measures)
            let metricLinesOfCodeLanguageDistribution = getMetricOfLinesOfCodeLanguageDistribution(metricResponse[0].component.measures)
            param[0] = countAndRatingBugUrl;
            async.map(param, getCountAndRatingForBugsOrVulnerability, function (err, countAndRatingBugResponse) {
                 let ratingBug = countAndRatingBugResponse[0].ratingValue;
                 let countBug  = countAndRatingBugResponse[0].countValue;
                 param[0] = countAndRatingVulnerabilityUrl;
                 async.map(param, getCountAndRatingForBugsOrVulnerability, function (err, countAndRatingVulnerabilityResponse) {
                    let data = {
                        projectName: config.resource,
                        dashboardUrl: dashboardUrl,
                        qualityGates: qualityGates,
                        lastAnalysisDate: lastAnalysisDate,
                        vulnerabilities: vulnerabilities,
                        metricBug: metricBug,
                        metricVulnerability: metricVulnerability,
                        metricCodeSmell: metricCodeSmell,
                        metricCoverage: metricCoverage,
                        metricDuplicatedLineDensity: metricDuplicatedLineDensity,
                        metricLinesOfCode: metricLinesOfCode,
                        metricLinesOfCodeLanguageDistribution: metricLinesOfCodeLanguageDistribution,
                        ratingBug: ratingBug,
                        countBug: countBug,
                        ratingVulnerability: countAndRatingVulnerabilityResponse[0].ratingValue,
                        countVulnerability: countAndRatingVulnerabilityResponse[0].countValue,
                        ratingCodeSmell: "?",
                        countCodeSmell: 0,
                        mapOfMetrics: mapOfMetrics
                    };
                    return job_callback(null, data);
             });
             });

        });
    });
  });

};
