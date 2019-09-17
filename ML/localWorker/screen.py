from mss import mss 
import numpy as np
import cv2
import math
import pyautogui
import time

def click():

  time.sleep(10)#wait ten seconds to allow for the metamaks screen to laod correctly

  #take screenshot adapted from https://python-mss.readthedocs.io/examples.html
  with mss() as sct:
    sct.shot(mon=-1, output='screens/cap.png')
    #print(sct.monitors)

  #search image using cv2 adapted from  https://stackoverflow.com/questions/7853628/how-do-i-find-an-image-contained-within-an-image/35378944
  method = cv2.TM_CCOEFF_NORMED  #TM_CCOEFF
  button = cv2.imread('screens/Button.png')
  screen = cv2.imread('screens/cap.png')

  ##I think that the result is a matrix to show the certainty of if the small image is in the big
  ##image at the given pixel (since we are only looking for one image then we only need the most
  ##likely or max position)
  result = cv2.matchTemplate(button, screen, method)

  #find the min and max positions and certainties
  mn,mx,(minX,minY),(maxX,maxY) = cv2.minMaxLoc(result)

  #display data fround
  print("posX: " + str(maxX))
  print("posY: " + str(maxY))
  print("certainty: " + str(mx))
  #print(result)

  #move the mouse to the center and click if the button is found
  if mx > 0.90:
    #print("click")
    pyautogui.click(maxX + math.floor(len(button[0])/2), maxY+ math.floor(len(button)/2))

click()
