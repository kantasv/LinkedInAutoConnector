// ==UserScript==
// @name         LinkedIn Autoconnector (at keyword search page)
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  This script allows you to increase your LinkedIn connections efficiently at keyword search page (People).
// @author       Kanta Yamaoka (contact me: https://www.linkedin.com/in/kanta-yamaoka/ )
// @match        https://www.linkedin.com/search/results/people/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    var pageIndex;
    var setIntervalId;

    var isCuurentPageSearchResultPage = () => {
        return window.location.href.toLocaleLowerCase().indexOf('search/results/people/') != 1
    }


    //detects page result index when current page is clearly the people search result page
    if (isCuurentPageSearchResultPage()) {
        window.location.href.split('&').forEach(elm => {
            if (elm.indexOf('page=') != -1) {
                var start = 'page='.length
                pageIndex = parseInt(elm.slice(start))
                console.log('pageIndex', pageIndex)
            }
        })
        //when could not "page=" but clearly the current page is clearly the people search result page
        if (!pageIndex) {
            window.location.href += '&page=1'
        }

    }

    var initAutoConnector = () => {
        var connectButtonCandidates = document.querySelectorAll('button[data-control-name="srp_profile_actions"]');
        var connectButtons = [];

        //filter buttons: get only connect buttons
        for (var i = 0; i < connectButtonCandidates.length; i++) {
            //console.log('Button condition', connectButtonCandidates[i].innerText)
            if (connectButtonCandidates[i].innerText == 'Connect') { connectButtons.push(connectButtonCandidates[i]) };
        }


        //gets random integers ranged from 0 to 300
        //by changing intervals, LinkedIn is not likely to detect this sort of automation
        var getRandomInteger = () => {
            var min = 0;
            var max = 300;
            return Math.floor(Math.random() * (max + 1 - min)) + min;
        }

        var connectButtonCount = 0

        var connectButtonOperation = () => {

            if (connectButtonCount < connectButtons.length) {

                //clicks "Connect button"
                connectButtons[connectButtonCount].click()
                //clicks "Send Invitation" button
                setTimeout(() => {
                    //clicks only when "Send Invitation" exists
                    var sendInvitationElement = document.querySelector('button[aria-label="Send invitation"]')
                    var verificationOperationDismissElement = document.querySelector('button[aria-label="Dismiss"]')
                    if (sendInvitationElement) {
                        console.log('sendInvitationElement exists', sendInvitationElement)
                        sendInvitationElement.click()
                    } else if (verificationOperationDismissElement) {
                        console.log(verificationOperationDismissElement)
                        //cancels when you face "verify" dialog
                        verificationOperationDismissElement.click()
                    } else {
                        console.log('Unexpected error. Could not find button elements for operations.')
                    }
                    connectButtonCount++
                }, getRandomInteger())
                

            } else {
                console.log('already clicked all connect buttons')
                clearInterval(setIntervalId)
                //when no connect buttons available
                //then move to next result page
                var currentUrl = window.location.href
                console.log(`page=${pageIndex}`, '->', `page=${pageIndex + 1}`)
                var nextPageUrl = currentUrl.replace(`page=${pageIndex}`, `page=${pageIndex + 1}`)
                //console.log(currentUrl.slice(50),nextPageUrl.slice(50))
                setTimeout(() => { window.location.href = nextPageUrl }, 1000)

            }

        }

        setIntervalId = setInterval(connectButtonOperation, 1000 + getRandomInteger())

    }


    //checks if the current page is the search result page
    if (isCuurentPageSearchResultPage()) {

        console.log('Found "Connect" buttons. Startsing automatically conectiong...')
        window.onload = () => { initAutoConnector() }

    } else {
        console.log('Could not find "Connect" buttons. This page may not be search result page.')
    }


    //adds Autoconnector bar element to DOM
    var initACBar = () => {

        var autoconnectStopButton = document.createElement('div');
        autoconnectStopButton.innerHTML = `<span id='ACstatus'>Sending invitations automatically...</span><p id='ACstopButton'>Click here to stop LinkedIn Autoconector temporalily</p>
        <h6>LinkedIn Autoconnector - Powered by Kanta Yamaoka.</h6>`


        var css = (prop, value) => {
            autoconnectStopButton.style[prop] = value
        }

        css('width', '30%')
        css('height', '100px')
        css('backgroundColor', 'white')
        css('color', '#0178B5')
        css('border', '2px solid #0178B5')
        css('borderRadius', '10px')
        css('textAlign', 'center')
        css('textHeight', '10px')
        css('position', 'fixed')
        css('bottom', '10%')
        css('left', '10%')
        css('zIndex', '10000')



        document.body.appendChild(autoconnectStopButton)
        document.getElementById('ACstopButton').style.margin = '10px'

        autoconnectStopButton.onclick = () => {
            clearInterval(setIntervalId)
            css('backgroundColor', '#c8c8c8')
            document.getElementById('ACstatus').innerText = 'Autoconnector temporalily disabled.'
            document.getElementById('ACstopButton').innerText = 'To use Autoconecttor again, please refresh the page.'

        }


    }

    initACBar()

})();