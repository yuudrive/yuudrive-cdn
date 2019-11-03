var app_url = window.location.origin, app_location = window.location;
$(function() {
    toastr.options.timeOut = 1500;
    toastr.options.extendedTimeOut = 60;
    toastr.options.progressBar = true;
    $('form#upload-url').submit(function(e) {
        e.preventDefault();
        if (!$('#file_url').val().trim().length) return;
        var items = $('#file_url').val().split('\n');
        $('#shareFrm1').hide();
        $('#sharetext, #sharehtmlcode, #sharebbcode').empty();
        UploadLinks(items);

    });
    $('form#upload-picker').submit(function(e) {
        e.preventDefault();
        var items = $(".files");
        UploadPicker(items);
    });
    $('#btn-del').click(function() {
        swal({
          title: 'Are you sure?',
          text: "You won't be able to revert this!",
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
          if(result.value) {
            $('input[name="file-item"]:checked').each(function(i){
                delFile($(this));
            });
          }
        });
    });
    $('#btn-mdl').bind('click',function() {
        if(!$('input[name=file-item]').is(":checked")) return
        $('#frm-edit').html('');$('#modalEdit').modal('show');
        $('input[name=file-item]:checked').each(function(i){
            if(i>=20) return;
            var t = $(this);
            var id = t.val();
            var fname = t.parent().parent('tr').find('td:nth-child(2)').text();
            $('#frm-edit').append(`<input class="form-control fName" minlength="5" data-id="${id}" name="fName" value="${fname}">`);
        });
   });
    $('#btn-link').bind('click',function() {
        results = [];
        if(!$('input[name=file-item]').is(":checked")) return;
        $('#txtarea-links').html('');$('#modalLink').modal('show');
        $('input[name=file-item]:checked').each(function(i){
            var flink = $(this).parent().parent('tr').find('a').attr('href');
            results.push(app_url+flink);
        });
        $('#txtarea-links').html(results.join('\r\n'));
   });
   $('form#frm-edit').submit(function(e) {
        e.preventDefault();
        var sArr = $(this).find('.fName');
        $.each(sArr, function(i, v) {
            var f = $(v);
            var id = f.attr('data-id'), nm = f.val();
            $.post(app_url+'/ajax/update-filename', {'fid':id, 'fname':nm}, function(data) {
                if(data.success) toastr.success(nm, "Rename Succeeded");
            }, 'json');
        });
    });
   $('select#protect-opt').change(function() {
        var v = $(this).find(":selected").val(), txt;
        $.post(app_url+'/ajax/update-protect', {protect:v}, function(data) {
           if (data.success) {
                if (v==1) txt = 'Feature was <i>Enabled</i>';
                else txt = 'Feature was <i>Disabled</i>';
                toastr.info(txt, 'Protect my Files');
           }
        }, 'json');
   });
   $('form#iProfile').submit(function(e) {
        e.preventDefault();
        $.post(app_url+'/ajax/update-vProfile',$(this).serialize(), function(data) {
            console.log(data);
            if (data.success) {
                toastr.success('Profile updated successfully');
           }
        }, 'json');
   })
   $('.search > input[type=text]').change(function(e) {
        $('#myfile').bootstrapTable('refresh');
   });
});
function dl(elm){
    elm.innerHTML='<i class="fa fa-circle-o-notch fa-spin fa-1x fa-fw"></i>Downloading';
    window.location.href=dlUrl;
}
function copier(elemt) {
    elemt.select();
    var cop = document.execCommand('copy');
    if(cop) alert('Copy to clipboard');
}
function delFile(t, alrt=false, single=false,adm=false) {
    id = single ? t : t.val();
    let data = {'file_id':id};
    if(single && adm) {
        var dmca = confirm('The file is Copyright?') ? prompt('DMCA Report by') : null;
        data['dmca'] = dmca;
    }
    $.post(app_url+'/ajax/delete', { file_id:id, dmca:dmca }, function(data) {
        if(data.success) {
            if(single) return swal('Delete File', 'File was successfully deleted', 'success');
            t.parent().parent('tr').fadeOut('fast', function() { $(this).remove(); });
            if(alrt) toastr.success('Success deleted', 'Delete File');
        } else {
            if(single) return swal('Delete File', data.msg, 'error');
            toastr.error('Error deleted', 'Delete File');
        }
    }, 'json');
}
function UploadLinks(items, index) {
    if(!index) index=0;
    var link = items[index];
    if (!link) return;
    $.ajax({
        url:app_url+'/ajax/copy-drive',
        type:'POST',
         cache:true,
         data:{file_url:link},
         dataType:'json',
         beforeSend: function() {
                $('#btn-share').prop('disabled', true);
                $('.preload1').show();
         }, success: function(response) {
                if(response.success) {
                    var resUrl=app_url+'/'+response.share[0].file_url;
                    var resName = response.share[0].file_name
                    var htmlCode = htmlEntities(`<a href="${resUrl}">${resName}</a>`)
                    var bbCode = htmlEntities(`[URL=${resUrl}]${resName}[/URL]`)
                    //results.push(resUrl.link(resUrl));
                    toastr.success(resName, 'Success');
                    $('#shareFrm1').show(400);
                    $('#sharetext').append(resUrl.link(resUrl)+'<br/>');
                    $('#sharehtmlcode').append(htmlCode+'<br/>');
                    $('#sharebbcode').append(bbCode+'<br/>');
                } else {
                    if (response.protect) {
                        toastr.error(response.msg, 'Protected by Owner');
                    } else {
                        toastr.error(response.msg, 'Error');
                    }
                }
         },complete:function() {
            if (typeof items[index] != 'undefined') UploadLinks(items, ++index);
            $('.preload1').hide();
            setTimeout(function(){$('#btn-share').prop('disabled', false);}, 5000);
        }, error: function(x,h,r) {
            swal(x.status,'Oow.. error when receiving request, make sure input URL correctly','error');
         }
     })
}
function UploadLinks_2(id) {
    results = [];
    $.ajax({
         url:app_url+'/ajax/share',
         type:'POST',
         cache:true,
         data:{file_url:id},
         dataType:'json',
         beforeSend: function() {
                $('#shareFrm1').hide();
                $('#btn-share').prop('disabled', true);
                $('.preload1').show();
                $('#sharetext').empty();
         }, success: function(response) {
                if(response.success) {
                    var resUrl=app_url+'/'+response.share[0].file_url;
                    results.push(resUrl.link(resUrl));
                    toastr.success(response.share[0].file_name, 'Success');
                    $('#shareFrm1').show(400);
                    $('#sharetext').html(results.join("<br/>"));
                } else {
                    if (response.protect) {
                        toastr.error(response.msg, 'Protected by Owner');
                    } else {
                        toastr.error(response.msg, 'Error');
                    }
                }
         },complete:function() {
            $('.preload1').hide();
            setTimeout(function(){$('#btn-share').prop('disabled', false);}, 5000);
        }, error: function(response) {
            console.log(response);
            swal('Failed','Oow.. error when receiving request, make sure input URL correctly','error');
         }
     })
}
function UploadPicker(items) {
    var result_links = []
    var result_htmlcode = []
    var result_bbcode = []
    if (items.length<1) return swal("Please choose a file to continue");
    $('#btn-share').prop('disabled', true);
    $.each(items, function(k, v){
        var i = $(v);
        var id = i.attr("g-id");
        i.find(".statFile").html(`<small class="badge-pill badge-secondary">uploading..</small>`);
        $.ajax({
            url:app_url+'/ajax/share-picker',
            type:'POST',
            cache:true,
            data:{data_file:id},
            success:function(response) {
                if(response.success) {
                    var share = response.share[0];
                    var resUrl=app_url+'/'+share.file_url;
                    var htmlCode = htmlEntities(`<a href="${resUrl}">${share.file_name}</a>`)
                    var bbCode = htmlEntities(`[URL=${resUrl}]${share.file_name}[/URL]`)
                    result_links.push(resUrl.link(resUrl));
                    result_htmlcode.push(htmlCode);
                    result_bbcode.push(bbCode);
                    i.find(".nameFile").attr(`href`, '/'+share.file_url);
                    i.find(".statFile").html(`<small class="badge-pill badge-success"><i class="fa fa-check"></i></small>`);
                } else {
                    i.find(".statFile").html(`<small class="badge-pill badge-danger">error</small>`);
                }
            },complete:function() {
                $('#shareFrm2').show(400);
                $('#sharetext').html(result_links.join("<br/>"));
                $('#sharehtmlcode').html(result_htmlcode.join("<br/>"));
                $('#sharebbcode').html(result_bbcode.join("<br/>"));
                setTimeout(function(){$('#btn-share').prop('disabled', false);}, 5000);
            }, error:function(x,h,r){
                console.log(x.status);
            }
        });
    });
}

const htmlEntities = (str) => {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}