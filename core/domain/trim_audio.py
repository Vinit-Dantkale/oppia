import base64
from pydub import AudioSegment
import os

def trim(extension, filename, raw_audio, trimming_metadata):
    dirname = os.getcwd()
    blobs_to_save = []
    temp_mp3_file = base64.b64encode(raw_audio)
    file = open(dirname + '/' + filename, 'w')
    file.write(base64.b64decode(temp_mp3_file))
    file.close()
    print(dirname+'  '+extension)
    if(extension is 'mp3'):
        temp_saved_audio = AudioSegment.from_mp3(dirname + '/' + filename)
        i = 1
        if(len(temp_saved_audio) >= 9000):
            for trimming_point in trimming_metadata['trimming_points']:
                trimmed_audio = temp_saved_audio[trimming_point["start_point"] : trimming_point["end_point"]]
                trimmed_audio.export(dirname + '/tempaudio' + i + '.' + extension, format = extension)
                i = i+1
                '''
                file = open(dirname + '/' + filename, 'rb')
                blobs_to_save.append(file.read())
                file.close()
                '''
        #Delete trimmed_audio file which was saved

    #Delete temp_mp3_file which was saved
    return blobs_to_save
