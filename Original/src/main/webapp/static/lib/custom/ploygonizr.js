/*
 * ----------------------------------------------------------------------------
 * "THE BEER-WARE LICENSE" (Revision 42):
 * <Martin@Revoltera.com> wrote this file. As long as you retain this notice,
 * you can do whatever you want with this stuff. If we meet some day, and you
 * think this stuff is worth it, you can buy me a beer in return.
 * ----------------------------------------------------------------------------
 */

(function($) {
    $.fn.polygonizr = function(options) {
        var defaults = {
            restNodeMovements: 1,
            duration: 3,
            nodeMovementDistance: 100,
            numberOfNodes: 25,
            nodeDotSize: 2.5,
            nodeEase: "easeOut",
            nodeFancyEntrance: !1,
            randomizePolygonMeshNetworkFormation: !0,
            specifyPolygonMeshNetworkFormation: function(i) {
                var forEachNode = {
                    x: this.canvasWidth - ((this.canvasWidth / 2) + (this.canvasHeight / 2) * Math.cos(i * (2 * Math.PI / this.numberOfNodes))) * Math.random(),
                    y: this.canvasHeight - (this.canvasHeight * (i / this.numberOfNodes))
                };
                return forEachNode
            },
            nodeRelations: 3,
            animationFps: 30,
            nodeDotColor: "240, 255, 250",
            nodeLineColor: "240, 255, 250",
            nodeFillColor: "240, 255, 250",
            nodeFillAlpha: 0.5,
            nodeLineAlpha: 0.5,
            nodeDotAlpha: 1.0,
            nodeFillSapce: !0,
            nodeGlowing: !1,
            canvasWidth: $(this).width(),
            canvasHeight: $(this).height(),
            canvasPosition: "absolute"
        };
        var settings = $.extend({}, defaults, options);
        return this.each(function() {
            var m_this = $(this);
            var canvasElement = document.createElement('canvas');
            canvasElement.width = settings.canvasWidth;
            canvasElement.height = settings.canvasHeight;
            canvasElement.style.position = settings.canvasPosition;
            m_this.append(canvasElement);
            var ctx = canvasElement.getContext('2d');
            var nodes = [];
            setupClusterNodes();
            startNodeAnimations();
            function setupClusterNodes() {
                for (var i = 0; i < settings.numberOfNodes; i++) {
                    var currentNode = {
                        x: 0,
                        y: 0
                    };
                    if (settings.randomizePolygonMeshNetworkFormation) {
                        currentNode.x = Math.random() * settings.canvasWidth;
                        currentNode.y = Math.random() * settings.canvasHeight
                    } else {
                        currentNode = settings.specifyPolygonMeshNetworkFormation(i)
                    }
                    nodes.push({
                        currentX: currentNode.x,
                        originX: currentNode.x,
                        startX: currentNode.x,
                        targetX: currentNode.x,
                        currentY: currentNode.y,
                        originY: currentNode.y,
                        startY: currentNode.x,
                        targetY: currentNode.y
                    })
                }
                for (var i = 0; i < nodes.length; i++) {
                    var closest = [];
                    var node = nodes[i];
                    for (var j = 0; j < nodes.length; j++) {
                        var tempNode = nodes[j];
                        if (node != tempNode) {
                            for (var k = 0; k < settings.nodeRelations; k++) {
                                if (closest[k] == undefined) {
                                    closest[k] = tempNode;
                                    break
                                }
                                if (getDistance(node, tempNode) < getDistance(node, closest[k])) {
                                    closest[k] = tempNode;
                                    break
                                }
                            }
                        }
                    }
                    node.Closest = closest;
                    setAlphaLevel(nodes[i])
                }
            }
            function startNodeAnimations() {
                var animator = new Animator(settings.nodeEase,settings.animationFps,settings.duration,settings.restNodeMovements,settings.nodeFancyEntrance,draw);
                animator.start()
            }
            const Constants = {
                Animation: {
                    EASING_LINEAR: "linear",
                    EASING_EASEIN: "easeIn",
                    EASING_EASEOUT: "easeOut",
                    EASING_EASEINOUT: "easeInOut",
                    EASING_ACCELERATE: "accelerateDecelerate",
                    EASING_DESCENDING: "descendingEntrance"
                }
            };
            function Animator(easing, fps, duration, delay, fancyEntrance, callback) {
                function step(timestamp) {
                    if (!m_startTime)
                        m_startTime = timestamp;
                    if (!m_lastFrameUpdate)
                        m_lastFrameUpdate = timestamp;
                    var currentFrame = Math.floor((timestamp - m_startTime) / (1000 / fps));
                    if (m_frameCount < currentFrame) {
                        m_frameCount = currentFrame;
                        var currentDuration = timestamp - m_lastFrameUpdate;
                        if (currentDuration <= m_duration) {
                            if (m_newTargetPossition) {
                                setNewTargetPossition();
                                m_newTargetPossition = !1
                            }
                            if (m_entranceSingleton && fancyEntrance) {
                                setNewNodePossition(Constants.Animation.EASING_DESCENDING, currentDuration, m_duration)
                            } else {
                                setNewNodePossition(easing, currentDuration, m_duration)
                            }
                            if (callback && typeof (callback) === "function") {
                                callback()
                            }
                        } else if (currentDuration >= (m_duration + m_delay)) {
                            m_lastFrameUpdate = timestamp;
                            m_newTargetPossition = !0;
                            m_entranceSingleton = !1
                        }
                    }
                    m_requestId = m_requestAnimationFrame(step)
                }
                this.isRunning = !1;
                this.start = function() {
                    if (!this.isRunning) {
                        this.isRunning = !0;
                        m_duration = duration * 1000;
                        m_delay = delay * 1000;
                        m_requestId = m_requestAnimationFrame(step)
                    }
                }
                ;
                this.pause = function() {
                    if (this.isRunning) {
                        m_cancleAnimationFrame(m_requestId);
                        this.isRunning = !1;
                        m_startTime = null;
                        m_frameCount = -1
                    }
                }
                ;
                var m_requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame;
                var m_cancleAnimationFrame = window.cancelAnimationFrame || window.mozCancelRequestAnimationFrame || window.webkitCancelRequestAnimationFrame || window.oCancelRequestAnimationFrame || window.msCancelRequestAnimationFrame;
                var m_startTime = null;
                var m_frameCount = -1
                var m_requestId = null;
                var m_lastFrameUpdate = null;
                var m_newTargetPossition = !0;
                var m_entranceSingleton = !0;
                var m_duration;
                var m_delay
            }
            function getEasing(easing, currentTime, startPossition, targetPossition, endTime) {
                switch (easing) {
                case Constants.Animation.EASING_LINEAR:
                    return (targetPossition - startPossition) * (currentTime / endTime) + startPossition;
                    break;
                case Constants.Animation.EASING_EASEIN:
                    currentTime /= endTime;
                    return (targetPossition - startPossition) * Math.pow(currentTime, 2) + startPossition;
                case Constants.Animation.EASING_EASEOUT:
                    currentTime /= endTime;
                    return -(targetPossition - startPossition) * currentTime * (currentTime - 2) + startPossition;
                case Constants.Animation.EASING_EASEINOUT:
                    currentTime /= (endTime / 2);
                    if (currentTime < 1)
                        return (targetPossition - startPossition) / 2 * Math.pow(currentTime, 2) + startPossition;
                    return -(targetPossition - startPossition) / 2 * ((currentTime - 1) * ((currentTime - 1) - 2) - 1) + startPossition;
                    break;
                case Constants.Animation.EASING_ACCELERATE:
                    currentTime /= (endTime / 2);
                    if (currentTime < 1)
                        return (targetPossition - startPossition) / 2 * Math.pow(currentTime, 3) + startPossition;
                    return (targetPossition - startPossition) / 2 * (Math.pow(currentTime - 2, 3) + 2) + startPossition;
                    break;
                case Constants.Animation.EASING_DESCENDING:
                    currentTime /= (endTime / 2);
                    if (currentTime < 1)
                        return (targetPossition - startPossition) / Math.pow(currentTime, 3) + startPossition;
                    return (targetPossition - startPossition) / (Math.pow(currentTime - 2, 3) + 2) + startPossition;
                    break;
                default:
                    return getEasing(Constants.Animation.EASING_LINEAR, currentTime, startPossition, targetPossition, endTime)
                }
            }
            function setNewNodePossition(easing, currentTime, endTime) {
                for (var i in nodes) {
                    nodes[i].currentX = getEasing(easing, currentTime, nodes[i].startX, nodes[i].targetX, endTime);
                    nodes[i].currentY = getEasing(easing, currentTime, nodes[i].startY, nodes[i].targetY, endTime)
                }
            }
            function setNewTargetPossition() {
                for (var i in nodes) {
                    nodes[i].targetX = nodes[i].originX + (Math.random() < 0.5 ? -Math.random() : Math.random()) * settings.nodeMovementDistance;
                    nodes[i].targetY = nodes[i].originY + (Math.random() < 0.5 ? -Math.random() : Math.random()) * settings.nodeMovementDistance;
                    nodes[i].startX = nodes[i].currentX;
                    nodes[i].startY = nodes[i].currentY
                }
            }
            function setAlphaLevel(node) {
                var screenDistance = Math.sqrt(Math.pow(settings.canvasWidth, 2) + Math.pow(settings.canvasHeight, 2));
                var nodeDistance = getDistance(node, node.Closest[0]);
                for (var i in node.Closest) {
                    nodeDistance += getDistance(node.Closest[i], node.Closest[(i + 1) % node.Closest.length])
                }
                var generalAlpha = 1 - (nodeDistance / screenDistance);
                node.lineAlpha = generalAlpha * settings.nodeLineAlpha;
                node.dotAlpha = generalAlpha * settings.nodeDotAlpha;
                if (generalAlpha > 0.85) {
                    node.fillAlpha = generalAlpha * settings.nodeFillAlpha;
                    node.lineAlpha = settings.nodeLineAlpha;
                    node.dotAlpha = settings.nodeDotAlpha
                } else if (generalAlpha < 0.8 && generalAlpha > 0.7) {
                    node.fillAlpha = 0.5 * generalAlpha * settings.nodeFillAlpha;
                    node.lineAlpha = settings.nodeLineAlpha;
                    node.dotAlpha = settings.nodeDotAlpha
                } else if (generalAlpha < 0.7 && generalAlpha > 0.4) {
                    node.fillAlpha = 0.2 * generalAlpha * settings.nodeFillAlpha
                } else {
                    node.fillAlpha = 0
                }
            }
            function draw() {
                ctx.clearRect(0, 0, settings.canvasWidth, settings.canvasHeight);
                for (var i in nodes) {
                    drawLines(nodes[i]);
                    drawCircle(nodes[i])
                }
            }
            function drawLines(node) {
                if (!node.lineAlpha > 0 && !node.fillAlpha > 0)
                    return;
                for (var i in node.Closest) {
                    if (node.lineAlpha > 0) {
                        ctx.beginPath();
                        ctx.moveTo(node.currentX, node.currentY);
                        ctx.lineTo(node.Closest[i].currentX, node.Closest[i].currentY);
                        ctx.strokeStyle = 'rgba(' + settings.nodeLineColor + ',' + node.lineAlpha + ')';
                        ctx.stroke()
                    }
                    if (settings.nodeFillSapce && node.fillAlpha > 0) {
                        ctx.beginPath();
                        ctx.moveTo(node.currentX, node.currentY);
                        ctx.lineTo(node.Closest[i].currentX, node.Closest[i].currentY);
                        ctx.lineTo(node.Closest[(i + 1) % node.Closest.length].currentX, node.Closest[(i + 1) % node.Closest.length].currentY);
                        ctx.fillStyle = 'rgba(' + settings.nodeFillColor + ',' + node.fillAlpha + ')';
                        ctx.fill()
                    }
                }
            }
            function drawCircle(node) {
                if (!node.dotAlpha > 0)
                    return;
                ctx.beginPath();
                ctx.arc(node.currentX, node.currentY, settings.nodeDotSize, 0, Math.PI * 2, !1);
                ctx.fillStyle = 'rgba(' + settings.nodeDotColor + ', ' + node.dotAlpha + ')';
                if (settings.nodeGlowing) {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = 'rgba(' + settings.nodeDotColor + ', ' + node.dotAlpha + ')'
                }
                ctx.fill()
            }
            function getDistance(firstNode, secondNode) {
                return Math.sqrt(Math.pow(firstNode.currentX - secondNode.currentX, 2) + Math.pow(firstNode.currentY - secondNode.currentY, 2))
            }
        })
    }
}(jQuery))
