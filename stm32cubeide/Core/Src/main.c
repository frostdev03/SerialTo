#include "main.h"
#include "usb_device.h"
//#include "usbd_cdc_if.c"
//#include "usb_device.c"

#define DATA_COUNT 10

typedef struct {
    uint16_t id;
    float temperature;
    float humidity;
} SensorData;

SensorData sensorData[DATA_COUNT];
char receiveCommand[64];
extern volatile uint8_t dataReady;

void Insert_SensorData(void) {
    for (int i = 0; i < DATA_COUNT; i++) {
        sensorData[i].id = i;
        sensorData[i].temperature = 25.0 + (i * 0.1);
        sensorData[i].humidity = 60.0 + (i * 0.2);
    }
}

//USB_SendData();

void USB_SendData(const char *data)
{
	CDC_Transmit_FS((uint8_t*)data, strlen(data));
}

//extern uint8_t CDC_Receive_FS(uint8_t* Buf, uint32_t *Len) {
//    if (*Len < sizeof(receiveCommand)) {
//        memcpy(receiveCommand, Buf, *Len);
//        receiveCommand[*Len] = '\0'; // Null-terminate string
//        dataReady = 1; // Set flag bahwa data diterima
//    }
//    return USBD_OK;
//}

void SystemClock_Config(void);
static void MX_GPIO_Init(void);

int main(void) {
    HAL_Init();
    SystemClock_Config();
    MX_USB_DEVICE_Init();

    char jsonBuffer[512];
    Insert_SensorData();

    while (1) {
    	if (dataReady)
    	{
            USB_SendData("Perintah diterima: ");
            USB_SendData(receiveCommand);
            USB_SendData("\r\n");

            if (strcmp(receiveCommand, "data") == 0) {
                USB_SendData("Mengirimkan data sensor...\r\n");
            } else if (strcmp(receiveCommand, "clear") == 0) {
                USB_SendData("Menghapus data...\r\n");
            }

    		dataReady = 0;

    		if (strncmp(receiveCommand, "data", 4) == 0)
    		{
    			Insert_SensorData();

    			int offset = 0;
    			offset += snprintf(jsonBuffer + offset, sizeof(jsonBuffer) - offset, "[");
    			for (int i = 0; i < DATA_COUNT; i++) {
    				offset += snprintf(jsonBuffer + offset, sizeof(jsonBuffer) - offset,
    						"{\"id\":%d,\"temperature\":%.2f,\"humidity\":%.2f}%s",
							sensorData[i].id, sensorData[i].temperature, sensorData[i].humidity,
							(i == DATA_COUNT - 1) ? "" : ",");
    			}
                snprintf(jsonBuffer + offset, sizeof(jsonBuffer) - offset, "]\r\n");
                USB_SendData(jsonBuffer);
    		} else if (strncmp(receiveCommand, "clear", 5) == 0) { // reset data
                memset(sensorData, 0, sizeof(sensorData));
                USB_SendData("Data cleared\r\n");
            }
    	}
    }
}

void SystemClock_Config(void)
{
  RCC_OscInitTypeDef RCC_OscInitStruct = {0};
  RCC_ClkInitTypeDef RCC_ClkInitStruct = {0};

  /** Configure the main internal regulator output voltage
  */
  if (HAL_PWREx_ControlVoltageScaling(PWR_REGULATOR_VOLTAGE_SCALE1) != HAL_OK)
  {
    Error_Handler();
  }
  /** Initializes the RCC Oscillators according to the specified parameters
  * in the RCC_OscInitTypeDef structure.
  */
  RCC_OscInitStruct.OscillatorType = RCC_OSCILLATORTYPE_MSI;
  RCC_OscInitStruct.MSIState = RCC_MSI_ON;
  RCC_OscInitStruct.MSICalibrationValue = 0;
  RCC_OscInitStruct.MSIClockRange = RCC_MSIRANGE_6;
  RCC_OscInitStruct.PLL.PLLState = RCC_PLL_ON;
  RCC_OscInitStruct.PLL.PLLSource = RCC_PLLSOURCE_MSI;
  RCC_OscInitStruct.PLL.PLLM = 1;
  RCC_OscInitStruct.PLL.PLLN = 40;
  RCC_OscInitStruct.PLL.PLLP = RCC_PLLP_DIV7;
  RCC_OscInitStruct.PLL.PLLQ = RCC_PLLQ_DIV2;
  RCC_OscInitStruct.PLL.PLLR = RCC_PLLR_DIV2;
  if (HAL_RCC_OscConfig(&RCC_OscInitStruct) != HAL_OK)
  {
    Error_Handler();
  }
  /** Initializes the CPU, AHB and APB buses clocks
  */
  RCC_ClkInitStruct.ClockType = RCC_CLOCKTYPE_HCLK|RCC_CLOCKTYPE_SYSCLK
                              |RCC_CLOCKTYPE_PCLK1|RCC_CLOCKTYPE_PCLK2;
  RCC_ClkInitStruct.SYSCLKSource = RCC_SYSCLKSOURCE_PLLCLK;
  RCC_ClkInitStruct.AHBCLKDivider = RCC_SYSCLK_DIV1;
  RCC_ClkInitStruct.APB1CLKDivider = RCC_HCLK_DIV1;
  RCC_ClkInitStruct.APB2CLKDivider = RCC_HCLK_DIV1;

  if (HAL_RCC_ClockConfig(&RCC_ClkInitStruct, FLASH_LATENCY_4) != HAL_OK)
  {
    Error_Handler();
  }
}

/**
  * @brief GPIO Initialization Function
  * @param None
  * @retval None
  */
static void MX_GPIO_Init(void)
{
  /* GPIO Ports Clock Enable */
  __HAL_RCC_GPIOA_CLK_ENABLE();

}

/* USER CODE BEGIN 4 */

/* USER CODE END 4 */

/**
  * @brief  This function is executed in case of error occurrence.
  * @retval None
  */
void Error_Handler(void)
{
  /* USER CODE BEGIN Error_Handler_Debug */
  /* User can add his own implementation to report the HAL error return state */
  __disable_irq();
  while (1)
  {
  }
  /* USER CODE END Error_Handler_Debug */
}

#ifdef  USE_FULL_ASSERT
/**
  * @brief  Reports the name of the source file and the source line number
  *         where the assert_param error has occurred.
  * @param  file: pointer to the source file name
  * @param  line: assert_param error line source number
  * @retval None
  */
void assert_failed(uint8_t *file, uint32_t line)
{
  /* USER CODE BEGIN 6 */
  /* User can add his own implementation to report the file name and line number,
     ex: printf("Wrong parameters value: file %s on line %d\r\n", file, line) */
  /* USER CODE END 6 */
}
#endif /* USE_FULL_ASSERT */

/************************ (C) COPYRIGHT STMicroelectronics *****END OF FILE****/
