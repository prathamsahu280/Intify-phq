import { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { Map } from '@/components/map';
import { XLS } from '@/components/xls';
import { KmlGenerator } from '@/components/kml-generator';
import { Filters } from '@/components/filters';
import { Toaster } from './components/ui/sonner';
import { Layer } from './components/layer';
import { RouteManager } from './components/RouteManager';
import { ImportSpreadsheet } from './components/ImportSpreadsheet';
import { ColumnMapping } from './components/ColumnMapping';
import { FilterSelection } from './components/FilterSelection';
import axios from 'axios';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { AlertDialogCancel, AlertDialogTitle } from '@radix-ui/react-alert-dialog';

const App = () => {
  const map = useRef(null);
  const [data, setData] = useState<xlsDataType[]>([]);
  const [kmlData, setkmlData] = useState<kmlDataType[]>([]);
  const [xlsData, setXlsData] = useState<xlsDataType[]>([]);
  const [legend, setLegend] = useState<string>("Name");
  const [showLayer, setShowLayer] = useState<showLayerType>({ marker: true, border: false });
  const [selectedFilters, setSelectedFilters] = useState<selectedFiltersType>({});
  const [removeUnknown, setRemoveUnknown] = useState<boolean>(false);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [columnMapping, setColumnMapping] = useState<Record<string, string> | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [usedFilters, setUsedFilters] = useState<{ [key: string]: string }>({});
  const [currentStep, setCurrentStep] = useState<'import' | 'mapping' | 'filters' | 'main'>('import');
  const [fileType, setFileType] = useState<'spreadsheet' | 'excel' | null>(null);

  useEffect(() => {
    const storedId = Cookies.get('spreadsheetId');
    const storedSheet = Cookies.get('selectedSheet');
    const storedMapping = Cookies.get('columnMapping');
    const storedFilters = Cookies.get('usedFilters');

    if (storedId) setSpreadsheetId(storedId);
    if (storedSheet) setSelectedSheet(storedSheet);
    if (storedMapping) setColumnMapping(JSON.parse(storedMapping));
    if (storedFilters) setUsedFilters(JSON.parse(storedFilters));

    if (storedId && storedSheet && storedMapping && storedFilters) {
      setCurrentStep('main');
    } else if (storedId && storedSheet && storedMapping) {
      setCurrentStep('filters');
    } else if (storedId && storedSheet) {
      setCurrentStep('mapping');
    }
  }, []);

  const handleChange = (type: keyof showLayerType) => {
    setShowLayer(prev => ({ ...prev, [type]: !prev[type] }))
  }

  const handleMappingComplete = (mapping: Record<string, string>) => {
    setColumnMapping(mapping);
    Cookies.set('columnMapping', JSON.stringify(mapping), { expires: 30 });
    setCurrentStep('filters');
  }

  const handleFilterComplete = (filters: { [key: string]: string }) => {
    setUsedFilters(filters);
    Cookies.set('usedFilters', JSON.stringify(filters), { expires: 30 });
    setCurrentStep('main');
  }

  const handleReset = (type: 'all' | 'columnMapping' | 'filters') => {
    switch (type) {
      case 'all':
        Cookies.remove('spreadsheetId');
        Cookies.remove('selectedSheet');
        Cookies.remove('columnMapping');
        Cookies.remove('usedFilters');
        setSpreadsheetId(null);
        setSelectedSheet('');
        setColumnMapping(null);
        setUsedFilters({});
        setCurrentStep('import');
        break;
      case 'columnMapping':
        Cookies.remove('columnMapping');
        setColumnMapping(null);
        setCurrentStep('mapping');
        break;
      case 'filters':
        Cookies.remove('usedFilters');
        setUsedFilters({});
        setCurrentStep('filters');
        break;
    }
  };

  useEffect(() => {
    if (spreadsheetId && selectedSheet) {
      const fetchHeaders = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/spreadsheet/headers?id=${spreadsheetId}&name=${selectedSheet}`);
          setHeaders(response.data);
        } catch (error) {
          console.error('Error fetching headers:', error);
        }
      };
      fetchHeaders();
    }
  }, [spreadsheetId, selectedSheet]);

  useEffect(() => {
    const storedFileType = Cookies.get('fileType') as 'spreadsheet' | 'excel' | null;
    if (storedFileType) {
      setFileType(storedFileType);
    }
  }, []);

  return (
    <main className='flex flex-col h-screen'>
      <AlertDialog
      >
        <AlertDialogTrigger className='absolute top-28 right-4 z-10 bg-red-500 text-white p-2 px-4 rounded-md'>Reset</AlertDialogTrigger>
        <AlertDialogContent className='gap-y-0'>
          <AlertDialogTitle className='text-3xl font-semibold'>Reset Options</AlertDialogTitle>
          <AlertDialogDescription className='text-base'>Choose what you want to reset:</AlertDialogDescription>
          <div className='grid grid-cols-2 gap-2 mt-4'>
            <AlertDialogAction className='bg-blue-500 hover:bg-blue-600' onClick={() => handleReset('filters')}>
              Reset Filters
            </AlertDialogAction>
            <AlertDialogAction className='bg-blue-500 hover:bg-blue-600' onClick={() => handleReset('columnMapping')}>
              Reset Column Mapping
            </AlertDialogAction>
            <AlertDialogAction className='bg-red-500 hover:bg-red-600' onClick={() => handleReset('all')}>
              Reset Completely
            </AlertDialogAction>
            <AlertDialogCancel className='bg-slate-200 hover:bg-slate-300 text-sm rounded-md'>Cancel</AlertDialogCancel>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      {currentStep === 'import' && (
        <div className='absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-white z-50'>
          <ImportSpreadsheet
            setSpreadsheetId={setSpreadsheetId}
            setSelectedSheet={setSelectedSheet}
            setCurrentStep={setCurrentStep}
            setFileType={setFileType}
          />
        </div>
      )}
      {currentStep === 'mapping' && (
        <div className='absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-white z-50'>
          <ColumnMapping
            spreadsheetId={spreadsheetId!}
            sheetName={selectedSheet}
            onMappingComplete={handleMappingComplete}
            setCurrentStep={setCurrentStep}
          />
        </div>
      )}
      {currentStep === 'filters' && (
        <div className='absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-white z-50'>
          <FilterSelection
            headers={headers}
            onComplete={handleFilterComplete}
            columnMapping={columnMapping!}
            setCurrentStep={setCurrentStep}
          />
        </div>
      )}
      {currentStep === 'main' && (
        <>
          <div className='absolute top-0 left-0 bg-white m-4 z-10 p-2 px-3 rounded-lg flex flex-col gap-y-2'>
            <div className='flex gap-x-2'>
              <input onChange={() => handleChange('marker')} type="checkbox" id='enable-markers' checked={showLayer.marker} />
              <label htmlFor="enable-markers" className='text-sm'>Markers</label>
            </div>
            <div className='flex gap-x-2'>
              <input onChange={() => handleChange('border')} type="checkbox" id='enable-border' checked={showLayer.border} />
              <label htmlFor="enable-border" className='text-sm'>Borders</label>
            </div>
          </div>
          <XLS
            showLayer={showLayer}
            map={map}
            legend={legend}
            data={data}
            setData={setData}
            setXlsData={setXlsData}
            setkmlData={setkmlData}
            removeUnknown={removeUnknown}
            setRemoveUnknown={setRemoveUnknown}
            spreadsheetId={spreadsheetId!}
            sheetName={selectedSheet}
            columnMapping={columnMapping!}
            usedFilters={usedFilters}
          />
          <KmlGenerator kmlData={kmlData} legendName={legend} selectedFilters={selectedFilters} removeUnknown={removeUnknown} />
          <Map map={map} />
          <Filters data={data} legend={legend} setLegend={setLegend} xlsData={xlsData} setData={setData} selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} removeUnknown={removeUnknown} />
          <Layer showLayer={showLayer} map={map} />
          <Toaster position='top-center' />
          <RouteManager data={data} map={map} />
        </>
      )}
    </main>
  );
};

export default App;